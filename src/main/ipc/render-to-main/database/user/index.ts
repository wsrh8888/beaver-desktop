import { DataUserCommand } from 'commonModule/type/ipc/database'
import dBServiceUser  from 'mainModule/database/services/user/user'

import logger from 'mainModule/utils/log'

const loggerName = 'database-user-handler'

class UserHandler {
  /**
   * 处理用户相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataUserCommand, data: any = {}, header: any = {}): Promise<any> {
    try {
      switch (command) {
        case DataUserCommand.GET_USER_INFO:
          return await dBServiceUser.getUserById(header, data)
        case DataUserCommand.GET_USERS_BASIC_INFO:
          return {
            users: await dBServiceUser.getUsersBasicInfo(data.userIds),
          }
        case DataUserCommand.GET_ALL_USERS:
          return {
            users: await dBServiceUser.getAllUsers(),
          }
        default:
          throw new Error(`不支持的用户数据库命令: ${command}`)
      }
    }
    catch (error) {
      logger.error({ text: '用户数据库命令处理失败', data: { command, error } }, loggerName)
      throw error
    }
  }
}
