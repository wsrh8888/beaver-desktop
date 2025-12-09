import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { datasyncGetSyncNotificationReadCursorsApi } from 'mainModule/api/datasync'
import { getNotificationReadCursorsApi } from 'mainModule/api/notification'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { NotificationReadCursorService } from 'mainModule/database/services/notification/read-cursor'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-notification-read-cursor')

class NotificationReadCursorSync {
  async checkAndSync() {
    logger.info({ text: '开始同步通知已读游标' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      const cursor = await DataSyncService.get('notification_read_cursors')
      const sinceVersion = cursor?.version || 0

      const resp = await datasyncGetSyncNotificationReadCursorsApi({
        sinceVersion,
      })

      const cursorVersions = resp.result.cursorVersions || []
      const needCategories = await this.filterCursorVersions(userId, cursorVersions)

      if (needCategories.length > 0)
        await this.syncReadCursors(userId, needCategories)

      const nextVersion = Math.max(
        sinceVersion,
        resp.result.maxVersion || 0,
        ...cursorVersions.map(item => item.version || 0),
      )

      await DataSyncService.upsert({
        module: 'notification_read_cursors',
        version: nextVersion,
        updatedAt: resp.result.serverTimestamp,
      }).catch(() => {})

      if (needCategories.length > 0) {
        sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.READ_CURSOR_UPDATE, {
          categories: needCategories,
          version: nextVersion,
        })
      }
    }
    catch (error) {
      logger.error({ text: '通知已读游标同步失败', data: { error: (error as any)?.message } })
    }
  }

  private async filterCursorVersions(userId: string, cursorVersions: Array<{ category: string, version: number }>): Promise<string[]> {
    if (!cursorVersions || cursorVersions.length === 0)
      return []

    const categories = cursorVersions.map(item => item.category).filter(cat => !!cat)
    if (categories.length === 0)
      return []

    const localMap = await NotificationReadCursorService.getVersionMap(userId, categories)

    return cursorVersions
      .filter(item => (localMap.get(item.category) || 0) < item.version)
      .map(item => item.category)
  }

  private async syncReadCursors(userId: string, categories: string[]) {
    const resp = await getNotificationReadCursorsApi({ categories })

    if (resp.result.cursors?.length) {
      for (const cursor of resp.result.cursors) {
        await NotificationReadCursorService.upsertCursor({
          userId,
          category: cursor.category,
          version: cursor.version,
          lastEventId: cursor.lastEventId,
          lastReadAt: cursor.lastReadAt,
          lastReadTime: cursor.lastReadTime,
          updatedAt: cursor.lastReadTime || Math.floor(Date.now() / 1000),
          createdAt: cursor.lastReadAt,
        })
      }
    }
  }
}

export const notificationReadCursorSync = new NotificationReadCursorSync()

