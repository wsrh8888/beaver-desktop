import { notificationInboxBusiness as inboxBusiness } from 'mainModule/business/notification/inbox'

/**
 * @description: 通知收件箱接收器 - 处理notification_inbox表的操作
 */
export class InboxReceiver {
  /**
   * 处理通知收件箱更新通知
   * 只处理 notification_inbox 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 处理notification_inbox表的更新
    for (const update of tableUpdates) {
      if (update.table === 'notification_inbox') {
        // 第三层循环：遍历data数组中的每个版本数据
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version && dataItem?.eventId) {
            await inboxBusiness.handleTableUpdates(dataItem.version, dataItem.eventId, update.userId)
          }
        }
      }
    }
  }
}
