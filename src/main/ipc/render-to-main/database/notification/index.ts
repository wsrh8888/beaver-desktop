import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataNotificationCommand } from 'commonModule/type/ipc/database'
import { notificationInboxBusiness, notificationReadCursorBusiness, notificationEventBusiness } from 'mainModule/business'
import { store } from 'mainModule/store'

class NotificationHandler {
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataNotificationCommand, data: any, header: ICommonHeader): Promise<any> {
    const userInfo = store.get('userInfo')
    const userId = header.userId || userInfo?.userId
    if (!userId)
      throw new Error('用户未登录')

    switch (command) {
      case DataNotificationCommand.GET_EVENTS_BY_IDS:
        return await notificationEventBusiness.getByIds(data?.eventIds || [])
      case DataNotificationCommand.GET_INBOX_BY_IDS:
        return await notificationInboxBusiness.getByEventIds(userId, data?.eventIds || [])
      case DataNotificationCommand.GET_READ_CURSORS:
        return await notificationReadCursorBusiness.getCursors(userId, data?.categories)
      case DataNotificationCommand.GET_UNREAD_SUMMARY:
        return await notificationInboxBusiness.getUnreadSummary(userId, data?.categories)
      default:
        throw new Error('通知数据库命令处理失败NotificationHandler')
    }
  }
}
