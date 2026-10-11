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
import Logger from 'mainModule/utils/logger'

const logger = new Logger('FsHandler')

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
      case FsCommand.READ_DIR:
        return this.readDir(data?.path)
      case FsCommand.READ_TEXT_FILE:
        return this.readTextFile(data?.path)
      case FsCommand.WRITE_TEXT_FILE:
        return this.writeTextFile(data?.path, data?.content)
      case FsCommand.READ_FILE_DATA_URL:
        return this.readFileDataUrl(data?.path)
      default:
        logger.error({ text: '收到未知的文件系统命令', data: { command } })
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
      logger.error({ text: '创建目录失败', data: { dirPath, error: error?.message } })
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

  private mimeOf(filePath: string) {
    const ext = path.extname(filePath).toLowerCase()
    const map: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.bmp': 'image/bmp',
    }
    return map[ext] || 'application/octet-stream'
  }

  private async readTextFile(filePath: unknown) {
    if (typeof filePath !== 'string' || !filePath.trim())
      return { success: false, error: '文件路径无效' }
    try {
      const content = await fs.promises.readFile(filePath, 'utf8')
      return { success: true, content }
    }
    catch (error: any) {
      logger.error({ text: '读取文本文件失败', data: { filePath, error: error?.message } })
      return { success: false, error: error?.message || '读取失败' }
    }
  }

  private async writeTextFile(filePath: unknown, content: unknown) {
    if (typeof filePath !== 'string' || !filePath.trim())
      return { success: false, error: '文件路径无效' }
    if (typeof content !== 'string')
      return { success: false, error: '内容无效' }
    try {
      await fs.promises.writeFile(filePath, content, 'utf8')
      return { success: true }
    }
    catch (error: any) {
      logger.error({ text: '写入文本文件失败', data: { filePath, error: error?.message } })
      return { success: false, error: error?.message || '写入失败' }
    }
  }

  private async readFileDataUrl(filePath: unknown) {
    if (typeof filePath !== 'string' || !filePath.trim())
      return { success: false, error: '文件路径无效' }
    try {
      const buffer = await fs.promises.readFile(filePath)
      const mime = this.mimeOf(filePath)
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
      return { success: true, dataUrl }
    }
    catch (error: any) {
      logger.error({ text: '读取文件 data URL 失败', data: { filePath, error: error?.message } })
      return { success: false, error: error?.message || '读取失败' }
    }
  }

  private async readDir(dirPath: unknown) {
    if (typeof dirPath !== 'string' || !dirPath.trim())
      return []
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
      return entries
        .map(entry => ({ name: entry.name, directory: entry.isDirectory() }))
        .sort((a, b) => {
          if (a.directory !== b.directory)
            return a.directory ? -1 : 1
          return a.name.localeCompare(b.name)
        })
    }
    catch (error: any) {
      logger.error({ text: '读取目录失败', data: { dirPath, error: error?.message } })
      return []
    }
  }
}

export default new FsHandler()
