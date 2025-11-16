import { groupMemberBusiness } from 'mainModule/business/group/group-member'

/**
 * @description: 群成员接收器 - 处理 group_members 表的操作
 */
export class GroupMemberReceiver {
  /**
   * 处理群成员表更新通知
   * 只处理 group_members 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // group 模块的 tableUpdatesBody 直接就是单个表的更新结构
    // { table: "group_members", data: [{ groupId: "...", userId: "...", version: 1 }, ...] }

    // 检查是否是 group_members 表的更新
    if (tableUpdatesBody.table !== 'group_members') {
      console.warn('GroupMemberReceiver 收到非 group_members 表的更新', tableUpdatesBody)
      return
    }

    // 处理每条数据记录
    for (const dataItem of tableUpdatesBody.data) {
      if (dataItem?.groupId && dataItem?.version) {
        await groupMemberBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.groupId, dataItem.version)
      }
    }
  }
}
