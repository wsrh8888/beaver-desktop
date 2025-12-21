import notificationEventBusiness from 'mainModule/business/notification/event'
const eventBusiness = notificationEventBusiness

/**
 * @description: 通知事件接收器 - 处理notification_event表的操作
 */
class EventReceiver {
  /**
   * 处理通知事件更新通知
   * 只处理 notification_event 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 处理notification_event表的更新
    for (const update of tableUpdates) {
      if (update.table === 'notification_event') {
        // 第三层循环：遍历data数组中的每个版本数据
        for (const dataItem of update.data) {
          if (dataItem?.eventId) {
            // 通知事件是全局的，直接用eventId同步
            await eventBusiness.handleTableUpdates(dataItem.eventId)
          }
        }
      }
    }
  }
}

export default new EventReceiver()
