import groupBusiness from 'mainModule/business/group/group'
import groupMemberBusiness from 'mainModule/business/group/group-member'

/**
 * @description: 群成员接收器 - 处理 groups 和 group_members 表的操作
 */
class GroupMemberReceiver {
  /**
   * 处理群成员表更新通知
   * 处理多表格式：{ tables: [{ table: "groups" }, { table: "group_members" }] }
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tables } = tableUpdatesBody

    // 只处理多表格式
    if (!tables || !Array.isArray(tables)) {
      console.warn('GroupMemberReceiver 只支持多表格式消息', tableUpdatesBody)
      return
    }

    // 遍历所有表更新，处理 groups 和 group_members 表
    for (const update of tables) {
      switch (update.table) {
        case 'groups':
          // 处理 groups 表的更新数据
          for (const dataItem of update.data || []) {
            if (dataItem?.groupId && dataItem?.version) {
              await groupBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.version, dataItem.groupId)
            }
          }
          break

        case 'group_members':
          // 处理 group_members 表的更新数据
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

export default new GroupMemberReceiver()
