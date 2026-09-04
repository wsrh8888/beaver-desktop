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

import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'
import chatHandler from './chat'
import circleHandler from './circle'
import emojiHandler from './emoji'
import friendHandler from './friend'
import groupHandler from './group'
import notificationHandler from './notification'
import userHandler from './user'

const loggerName = 'database-handler'
const logger = new Logger(loggerName)

class DatabaseHandler {
  /**
   * 处理数据库相关的IPC命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DatabaseCommand, data: any = {}): Promise<unknown> {
    logger.info({ text: '处理数据库命令', data: { command, data } })
    const userInfo = store.get('userInfo')
    const header = {
      userId: userInfo?.userId || '',
    }
    try {
      switch (command) {
        case DatabaseCommand.USER:
          return await userHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.FRIEND:
          return await friendHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.CHAT:
          return await chatHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.GROUP:
          return await groupHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.CIRCLE:
          return await circleHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.EMOJI:
          return await emojiHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.NOTIFICATION:
          return await notificationHandler.handle(_event, data?.command, data?.data, header)
        default:
          logger.error({ text: '收到未处理的数据库命令', data: { command } })
          return null
      }
    }
    catch (error) {
      logger.error({
        text: '数据库命令处理失败',
        data: {
          command,
          subCommand: data?.command,
          message: (error as Error)?.message,
          stack: (error as Error)?.stack,
        },
      })
      throw error
    }
  }
}

export default new DatabaseHandler()
