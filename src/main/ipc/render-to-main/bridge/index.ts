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

import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import { BridgeCommand } from 'commonModule/type/ipc/command'
import bridgeRegistry from 'mainModule/bridge/registry'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('BridgeHandler')
import appHandler from './app'
import userHandler from './user'

class BridgeHandler {
  handle(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: BridgeCommand | string,
    data: { method?: string, params?: Record<string, unknown> } = {},
  ): IBeaverBridgeResult | void {
    if (command !== BridgeCommand.INVOKE) {
      logger.error({ text: `bridge 未知命令: ${command}` })
      return { code: 1, msg: `unknown command: ${command}`, result: null }
    }

    const session = bridgeRegistry.get(event.sender.id)
    if (!session || (session.win && session.win.isDestroyed())) {
      return { code: 1, msg: 'bridge context not found', result: null }
    }

    const method = typeof data?.method === 'string' ? data.method : ''
    const params = data?.params && typeof data.params === 'object' ? data.params : {}
    const [moduleName, action = ''] = method.split('.')

    switch (moduleName) {
      case 'app':
        return appHandler.handle(action, params, session)
      case 'user':
        return userHandler.handle(action, params, session)
      default:
        logger.error({ text: `bridge 未知模块: ${method}` })
        return { code: 1, msg: `unknown method: ${method}`, result: null }
    }
  }
}

export default new BridgeHandler()
