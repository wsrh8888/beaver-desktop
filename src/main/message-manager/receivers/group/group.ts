import groupBusiness from 'mainModule/business/group/group'
import groupMemberBusiness from 'mainModule/business/group/group-member'

/**
 * @description: 群组接收器 - 处理 groups 和 group_members 表的操作
 */
class GroupReceiver {
  /**
   * 处理群组表更新通知
   * 支持处理 groups 和 group_members 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tables } = tableUpdatesBody

    // 第一层循环：遍历所有的表更新
    for (const update of tables || []) {
      // 第二层循环：在switch中处理每种表类型
      switch (update.table) {
        case 'groups':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data || []) {
            if (dataItem?.groupId && dataItem?.version) {
              await groupBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.version, dataItem.groupId)
            }
          }
          break

        case 'group_members':
          // 第三层循环：遍历data数组中的每个版本数据
          for (const dataItem of update.data || []) {
            if (dataItem?.groupId && dataItem?.userId && dataItem?.version) {
              await groupMemberBusiness.handleTableUpdates(dataItem.userId, dataItem.groupId, dataItem.version)
            }
          }
          break

        default:
          // 忽略未知表的更新
          break
      }
    }
  }
}

export default new GroupReceiver()
