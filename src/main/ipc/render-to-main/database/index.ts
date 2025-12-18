import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import chatHandler from './chat'
import emojiHandler from './emoji'
import friendHandler from './friend'
import groupHandler from './group'
import notificationHandler from './notification'
import userHandler from './user'

const loggerName = 'database-handler'

class DatabaseHandler {
  /**
   * 处理数据库相关的IPC命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DatabaseCommand, data: any = {}): Promise<unknown> {
    logger.info({ text: '处理数据库命令', data: { command, data } }, loggerName)
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
        case DatabaseCommand.EMOJI:
          return await emojiHandler.handle(_event, data?.command, data?.data, header)
        case DatabaseCommand.NOTIFICATION:
          return await notificationHandler.handle(_event, data?.command, data?.data, header)
        default:
          logger.error({ text: `未处理的数据库命令: ${command}` }, loggerName)
          return null
      }
    }
    catch (error) {
      logger.error({ text: '数据库命令处理失败 DatabaseHandler', data: { command, error, data: data?.command } }, loggerName)
      throw error
    }
  }
}

export default new DatabaseHandler()
