/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import fs from 'node:fs'
import path from 'node:path'
import { FsCommand } from 'commonModule/type/ipc/command'
import type { FsSystemPathName } from 'commonModule/type/preload/fs'
import { getRootPath } from 'mainModule/config'
import { app, BrowserWindow, dialog } from 'electron'
import logger from 'mainModule/utils/log'

class FsHandler {
  async handle(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: FsCommand | string,
    data: any,
  ) {
    switch (command) {
      case FsCommand.MKDIR:
        return this.mkdir(data?.path)
      case FsCommand.EXISTS:
        return this.exists(data?.path)
      case FsCommand.GET_PATH:
        return this.getPath(data?.name)
      case FsCommand.JOIN:
        return this.join(data?.parts)
      case FsCommand.BASENAME:
        return this.basename(data?.path)
      case FsCommand.SHOW_OPEN_DIRECTORY:
        return this.showOpenDirectory(event, data)
      default:
        logger.error({ text: `文件系统处理未知命令: ${command}` }, 'FsHandler')
        return null
    }
  }

  private async mkdir(dirPath: unknown) {
    if (typeof dirPath !== 'string' || !dirPath.trim()) {
      return { success: false, error: '目录路径无效' }
    }
    try {
      await fs.promises.mkdir(dirPath, { recursive: true })
      return { success: true, path: dirPath }
    }
    catch (error: any) {
      logger.error({ text: '创建目录失败', data: { dirPath, error: error?.message } }, 'FsHandler')
      return { success: false, error: error?.message || '创建目录失败' }
    }
  }

  private async exists(targetPath: unknown) {
    if (typeof targetPath !== 'string' || !targetPath.trim())
      return false
    try {
      await fs.promises.access(targetPath)
      return true
    }
    catch {
      return false
    }
  }

  private getPath(name: unknown) {
    if (typeof name !== 'string' || !name.trim())
      throw new Error('系统路径名无效')
    if (name === 'root')
      return getRootPath()
    return app.getPath(name as Exclude<FsSystemPathName, 'root'>)
  }

  private join(parts: unknown) {
    if (!Array.isArray(parts) || parts.length === 0)
      return ''
    const segments = parts.filter(item => typeof item === 'string') as string[]
    return path.join(...segments)
  }

  private basename(targetPath: unknown) {
    if (typeof targetPath !== 'string')
      return ''
    return path.basename(targetPath)
  }

  private async showOpenDirectory(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    data: { title?: string, defaultPath?: string } = {},
  ) {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      title: data.title || '选择文件夹',
      properties: ['openDirectory', 'createDirectory'],
    }
    if (data.defaultPath)
      options.defaultPath = data.defaultPath

    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)

    if (result.canceled || !result.filePaths[0])
      return null

    const selected = result.filePaths[0]
    return {
      path: selected,
      name: path.basename(selected),
    }
  }
}

export default new FsHandler()
