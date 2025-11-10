import { DataGroupCommand } from 'commonModule/type/ipc/database'
import { GroupMemberService } from 'mainModule/database/services/group/group-member'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

const loggerName = 'group-handler'

export class GroupHandler {
  /**
   * 处理群组相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataGroupCommand, data: any, header: any = {}): Promise<any> {
    logger.info({ text: '处理群组命令', data: { command, data } }, loggerName)
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    switch (command) {
      case DataGroupCommand.GET_GROUP_LIST:
        return await GroupMemberService.getUserGroups(header.userId)
      case DataGroupCommand.GET_GROUP_MEMBERS:
        return await GroupMemberService.getGroupMembers(data.groupId)
      default:
        throw new Error('群组数据库命令处理失败')
    }
  }
}
