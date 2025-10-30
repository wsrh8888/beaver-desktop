import type { IUserInfoRes } from 'commonModule/type/ajax/user'
import type { DatabaseCommand } from 'commonModule/type/ipc/command'
import { UserService } from 'mainModule/database/services/user/user'
import logger from 'mainModule/utils/log'

const loggerName = 'database-user-handler'

export class UserHandler {
  /**
   * 处理用户相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DatabaseCommand, data: any = {}, header: any = {}): Promise<IUserInfoRes | null> {
    try {
      return await UserService.getUserById(header, data)
    }
    catch (error) {
      logger.error({ text: '用户数据库命令处理失败', data: { command, error } }, loggerName)
      throw error
    }
  }
}
