import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataNotificationCommand } from 'commonModule/type/ipc/database'
import { NotificationEventService } from 'mainModule/database/services/notification/event'
import { NotificationInboxService } from 'mainModule/database/services/notification/inbox'
import { NotificationReadCursorService } from 'mainModule/database/services/notification/read-cursor'
import { store } from 'mainModule/store'

export class NotificationHandler {
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataNotificationCommand, data: any, header: ICommonHeader): Promise<any> {
    const userInfo = store.get('userInfo')
    const userId = header.userId || userInfo?.userId
    if (!userId)
      throw new Error('用户未登录')

    switch (command) {
      case DataNotificationCommand.GET_EVENTS_BY_IDS:
        return await NotificationEventService.getByIds(data?.eventIds || [])
      case DataNotificationCommand.GET_INBOX_BY_IDS:
        return await NotificationInboxService.getByEventIds(userId, data?.eventIds || [])
      case DataNotificationCommand.GET_READ_CURSORS:
        return await NotificationReadCursorService.getCursors(userId, data?.categories)
      case DataNotificationCommand.GET_UNREAD_SUMMARY:
        return await NotificationInboxService.getUnreadSummary(userId, data?.categories)
      default:
        throw new Error('通知数据库命令处理失败')
    }
  }
}

