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

import { CacheCommand } from 'commonModule/type/ipc/command'
import cacheManager from 'mainModule/cache'
// import { FileCacheManager } from 'mainModule/cache/manager'
import logger from 'mainModule/utils/log'
import { shell } from 'electron'

/**
 * 缓存IPC处理器 - 清晰的方法分离
 */
class CacheHandler {
  /**
   * 处理缓存相关命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: CacheCommand, data: any): Promise<any> {
    try {
      switch (command) {
        case CacheCommand.GET:
          return await cacheManager.get(data.type, data.fileKey)
        case CacheCommand.SET:
          return await cacheManager.add(data.type, data.fileKey)
        case CacheCommand.OPEN: {
          const localPath = await cacheManager.add(data.type, data.fileKey)
          if (!localPath) {
            return null
          }
          await shell.openPath(localPath)
          return localPath
        }
        default:
          logger.error({ text: `缓存处理未知命令: ${command}` }, 'CacheHandler')
          return null
      }
    }
    catch (error) {
      logger.error({ text: '缓存处理异常', data: (error as any)?.message || error }, 'CacheHandler')
      throw error
    }
  }
}

export default new CacheHandler()
