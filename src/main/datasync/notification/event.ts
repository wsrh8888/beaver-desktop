import { NotificationModule, NotificationNotificationCommand } from 'commonModule/type/preload/notification'
import { datasyncGetSyncNotificationEventsApi } from 'mainModule/api/datasync'
import { getNotificationEventsByIdsApi } from 'mainModule/api/notification'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceNotificationEvent  from 'mainModule/database/services/notification/event'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-notification-event')

class NotificationEventSync {
  async checkAndSync() {
    logger.info({ text: '开始同步通知事件' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      const cursor = await dbServiceDataSync.get({ module: 'notification_events' })
      const sinceVersion = cursor?.version || 0

      const resp = await datasyncGetSyncNotificationEventsApi({
        sinceVersion,
      })

      const eventVersions = resp.result.eventVersions || []
      const needEventIds = await this.filterEventVersions(eventVersions)

      if (needEventIds.length > 0)
        await this.syncEvents(needEventIds)

      const nextVersion = Math.max(
        sinceVersion,
        resp.result.maxVersion || 0,
        ...eventVersions.map(item => item.version || 0),
      )

      await dbServiceDataSync.upsert({
        module: 'notification_events',
        version: nextVersion,
        updatedAt: resp.result.serverTimestamp,
      }).catch(() => {})

      if (needEventIds.length > 0) {
        sendMainNotification('*', NotificationModule.DATABASE_NOTIFICATION, NotificationNotificationCommand.EVENT_UPDATE, {
          eventIds: needEventIds,
          version: nextVersion,
        })
      }
    }
    catch (error) {
      logger.error({ text: '通知事件同步失败', data: { error: (error as any)?.message } })
    }
  }

  private async filterEventVersions(eventVersions: Array<{ eventId: string, version: number }>): Promise<string[]> {
    if (!eventVersions || eventVersions.length === 0)
      return []

    const eventIds = eventVersions.map(item => item.eventId).filter(id => !!id)
    if (eventIds.length === 0)
      return []

    const localMap = await dBServiceNotificationEvent.getVersionMapByIds({ eventIds })

    return eventVersions
      .filter(item => (localMap.get(item.eventId) || 0) < item.version)
      .map(item => item.eventId)
  }

  private async syncEvents(eventIds: string[]) {
    const batchSize = 50
    for (let i = 0; i < eventIds.length; i += batchSize) {
      const batchIds = eventIds.slice(i, i + batchSize)
      const resp = await getNotificationEventsByIdsApi({ eventIds: batchIds })

      if (resp.result.events?.length) {
        const rows = resp.result.events.map(event => ({
          eventId: event.eventId,
          eventType: event.eventType,
          category: event.category,
          version: event.version,
          fromUserId: event.fromUserId,
          targetId: event.targetId,
          targetType: event.targetType,
          payload: event.payload,
          priority: event.priority,
          status: event.status,
          dedupHash: event.dedupHash,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        }))

        await dBServiceNotificationEvent.batchUpsert(rows)
      }
    }
  }
}

export const notificationEventSync = new NotificationEventSync()
