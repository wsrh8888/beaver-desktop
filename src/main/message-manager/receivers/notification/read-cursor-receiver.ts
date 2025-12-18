import notificationReadCursorBusiness from 'mainModule/business/notification/read-cursor'
const readCursorBusiness = notificationReadCursorBusiness

/**
 * @description: 通知已读游标接收器 - 处理notification_read_cursor表的操作
 */
class ReadCursorReceiver {
  /**
   * 处理通知已读游标更新通知
   * 只处理 notification_read_cursor 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 处理notification_read_cursor表的更新
    for (const update of tableUpdates) {
      if (update.table === 'notification_read_cursor') {
        // 第三层循环：遍历data数组中的每个版本数据
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version) {
            await readCursorBusiness.handleTableUpdates(dataItem.version, update.userId, dataItem.category)
          }
        }
      }
    }
  }
}

export default new ReadCursorReceiver()
