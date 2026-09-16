/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { getDatabaseIpcHandler } from '@beaver-im/beaver/main'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'
import chatHandler from './chat'
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
  async handle(_event: Electron.IpcMainInvokeEvent, command: string, data: any = {}): Promise<unknown> {
    logger.info({ text: '处理数据库命令', data: { command, data } })
    const userInfo = store.get('userInfo')
    const header = {
      userId: userInfo?.userId || '',
    }
    try {
      // 能力包注册的数据库通道优先（如 database:circle）
      const pluginHandler = getDatabaseIpcHandler(command)
      if (pluginHandler)
        return await pluginHandler(_event, data?.command, data?.data, header)

      switch (command) {
        case DatabaseCommand.USER:
          return await userHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.FRIEND:
          return await friendHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.CHAT:
          return await chatHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.GROUP:
          return await groupHandler.handle(_event, data?.command, data?.data, header)
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
