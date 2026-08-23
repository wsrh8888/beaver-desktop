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

import type { AxiosResponse } from 'axios'
import type { RenderCommand } from 'commonModule/type/ipc/command'
import { ClipboardCommand } from 'commonModule/type/ipc/command'
import { CacheType } from 'commonModule/type/cache/cache'
import { fileURLToPath } from 'node:url'
import { clipboard, nativeImage } from 'electron'
import cacheManager from 'mainModule/cache'
import head from 'mainModule/utils/request/head'

type ClipboardData = { fileKey?: string, text?: string }

class ClipboardHandler {
  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: ClipboardCommand | RenderCommand,
    data: ClipboardData,
  ): boolean | Promise<boolean> {
    switch (command) {
      case ClipboardCommand.COPY_IMAGE:
        return this.copyImage(data.fileKey ?? '')
      case ClipboardCommand.COPY_TEXT:
        return this.copyText(data.text ?? '')
      default:
        return false
    }
  }

  private copyText(text: string): boolean {
    if (!text?.trim())
      return false
    clipboard.writeText(text)
    return true
  }

  /**
   * 有且只有 2 种情况：本地缓存（file://）或云端 URL（http(s)）
   */
  private async copyImage(fileKey: string): Promise<boolean> {
    if (!fileKey?.trim())
      return false
    try {
      const urlOrPath = await cacheManager.get(CacheType.USER_IMAGE, fileKey)
      let img: Electron.NativeImage | null = null
      console.error('11111111111111111111')
      console.error(urlOrPath)

      if (urlOrPath.startsWith('file://')) {
        // 本地：缓存文件路径
        const localPath = fileURLToPath(urlOrPath)
        img = nativeImage.createFromPath(localPath)
      }
      else {
        // 云端：在线 URL，用封装好的 head 拉取后写剪贴板
        const res = await head({ url: urlOrPath, method: 'GET', responseType: 'arraybuffer' }).catch(() => null) as AxiosResponse<ArrayBuffer> | null
        if (res?.status === 200 && res.data) {
          const buf = Buffer.from(res.data)
          img = nativeImage.createFromBuffer(buf)
        }
      }

      if (img && !img.isEmpty()) {
        clipboard.writeImage(img)
        return true
      }
      return false
    }
    catch (e) {
      console.warn('clipboard copyImage failed', fileKey, (e as Error)?.message)
      return false
    }
  }
}

export default new ClipboardHandler()
