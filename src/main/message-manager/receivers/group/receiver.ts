
import { groupBusiness } from 'mainModule/business/group/group'

/**
 * @description: 群组接收器 - 处理 groups 表的操作
 */
export class GroupReceiver {
  /**
   * 处理群组表更新通知
   * 只处理 groups 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // group 模块的 tableUpdatesBody 直接就是单个表的更新结构
    // { table: "groups", data: [{ groupId: "...", version: 1 }, ...] }

    // 检查是否是 groups 表的更新
    if (tableUpdatesBody.table !== 'groups') {
      console.warn('GroupReceiver 收到非 groups 表的更新', tableUpdatesBody)
      return
    }

    // 处理每条数据记录
    for (const dataItem of tableUpdatesBody.data) {
      if (dataItem?.version) {
        await groupBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.version, dataItem?.groupId)
      }
    }
  }
}
