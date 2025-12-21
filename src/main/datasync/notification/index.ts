import { notificationEventSync } from './event'
import { notificationInboxSync } from './inbox'
import { notificationReadCursorSync } from './read-cursor'

// 通知中心数据同步入口（事件/收件箱/已读游标分开处理）
export const notificationDatasync = new class NotificationDatasync {
  async checkAndSync() {
    await notificationEventSync.checkAndSync()
    await notificationInboxSync.checkAndSync()
    await notificationReadCursorSync.checkAndSync()
  }
}()
