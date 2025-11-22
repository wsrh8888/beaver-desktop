import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataGroupCommand } from 'commonModule/type/ipc/database'
import { groupBusiness } from 'mainModule/business/group/group'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

const loggerName = 'group-handler'

export class GroupHandler {
  /**
   * 处理群组相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataGroupCommand, data: any, header: ICommonHeader): Promise<any> {
    logger.info({ text: '处理群组命令', data: { command, data } }, loggerName)
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    switch (command) {
      case DataGroupCommand.GET_GROUP_LIST:
        return await groupBusiness.getGroupList(header, data)
      case DataGroupCommand.GET_GROUPS_BATCH:
        return await groupBusiness.getGroupsBatch(header, data)
      case DataGroupCommand.GET_GROUP_MEMBERS:
        return await groupBusiness.getGroupMembers(header, data)
      case DataGroupCommand.GET_GROUP_MEMBERS_BATCH:
        return await groupBusiness.getGroupMembersBatch(header, data)
      case DataGroupCommand.GET_GROUP_JOIN_REQUEST_LIST:
        // 合并为同一个方法：获取用户相关的群组申请（包括用户申请的 + 别人申请用户管理的群组）
        return await groupBusiness.getGroupJoinRequests(header, data)
      default:
        throw new Error('群组数据库命令处理失败')
    }
  }
}
