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

import type { RenderCommand } from 'commonModule/type/ipc/command'
import type { IStoreOptions } from 'commonModule/type/mainStore'
import { StorageCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('StorageHandler')

class StorageHandler {
  /**
   * 统一的存储处理入口（同步）
   */
  handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: StorageCommand | RenderCommand, data: any): any {
    switch (command) {
      case StorageCommand.GET:
        return this.handleGet(data)
      case StorageCommand.SET:
        return this.handleSet(data)
      case StorageCommand.REMOVE:
        return this.handleRemove(data)
      default:
        logger.error({ text: '存储处理未知命令', data: { command } })
        return null
    }
  }

  /**
   * 获取存储数据
   */
  private handleGet(data: { key: string }): any {
    return store.get(data.key)
  }

  /**
   * 设置存储数据
   */
  private handleSet(data: { key: string, value: any, options?: IStoreOptions }): void {
    store.set(data.key, data.value, data.options)
  }

  /**
   * 删除存储数据
   */
  private handleRemove(data: { key: string, options?: IStoreOptions }): void {
    store.delete(data.key, data.options)
  }
}

export default new StorageHandler()
