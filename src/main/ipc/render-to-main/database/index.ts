import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import { ChatHandler } from './chat'
import { FriendHandler } from './friend'
import { GroupHandler } from './group'
import { UserHandler } from './user'

const loggerName = 'database-handler'

export class DatabaseHandler {
  /**
   * 处理数据库相关的IPC命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DatabaseCommand, data: any = {}): Promise<unknown> {
    logger.info({ text: '处理数据库命令', data: { command, data } }, loggerName)
    const userInfo = store.get('userInfo')
    const header = {
      userId: userInfo?.userId,
    }
    try {
      switch (command) {
        case DatabaseCommand.USER:
          return await UserHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.FRIEND:
          return await FriendHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.CHAT:
          return await ChatHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.GROUP:
          return await GroupHandler.handle(_event, data?.command, data?.data, header)
        default:
          logger.error({ text: `未处理的数据库命令: ${command}` }, loggerName)
          return null
      }
    }
    catch (error) {
      logger.error({ text: '数据库命令处理失败', data: { command, error } }, loggerName)
      throw error
    }
  }
}
