import { groupJoinRequestBusiness } from 'mainModule/business/group/group-join-request'

/**
 * @description: 群加入请求接收器 - 处理 group_join_requests 表的操作
 */
export class GroupJoinRequestReceiver {
  /**
   * 处理群加入请求表更新通知
   * 只处理 group_join_requests 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // group 模块的 tableUpdatesBody 直接就是单个表的更新结构
    // { table: "group_join_requests", data: [{ groupId: "...", applicantUserId: "...", version: 1 }, ...] }

    // 检查是否是 group_join_requests 表的更新
    if (tableUpdatesBody.table !== 'group_join_requests') {
      console.warn('GroupJoinRequestReceiver 收到非 group_join_requests 表的更新', tableUpdatesBody)
      return
    }

    // 处理每条数据记录
    for (const dataItem of tableUpdatesBody.data) {
      if (dataItem?.groupId && dataItem?.version) {
        await groupJoinRequestBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.groupId, dataItem.version)
      }
    }
  }
}
