import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiCollectsByIdsApi } from 'mainModule/api/emoji'
import { EmojiCollectService } from 'mainModule/database/services/emoji/collect'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

// 表情收藏同步模块
export class CollectSync {
  // 同步表情收藏数据（emoji_collect 表）
  async sync(collectVersions: any[]) {
    if (!collectVersions || collectVersions.length === 0) {
      return
    }

    // 过滤出需要更新的收藏记录UUID
    const needUpdateCollectUuids = await this.compareAndFilterCollectVersions(collectVersions)
    if (needUpdateCollectUuids.length > 0) {
      await this.syncEmojiCollectData(needUpdateCollectUuids)
    }
  }

  // 对比本地数据，过滤出需要更新的收藏记录ID
  private async compareAndFilterCollectVersions(collectVersions: any[]): Promise<string[]> {
    const ids = collectVersions
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (ids.length === 0) {
      return []
    }

    const existingRecordsMap = await EmojiCollectService.getCollectsByIds(ids)

    const needUpdateIds = ids.filter((id) => {
      const existingRecord = existingRecordsMap.get(id)
      const serverVersion = collectVersions.find(item => item.id === id)?.version || 0
      return !existingRecord || existingRecord.version < serverVersion
    })

    return needUpdateIds
  }

  // 同步表情收藏数据
  private async syncEmojiCollectData(collectIds: string[]) {
    if (collectIds.length === 0) {
      return
    }

    const syncedCollects: Array<{ collectId: string, version: number }> = []

    const batchSize = 50

    for (let i = 0; i < collectIds.length; i += batchSize) {
      const batchIds = collectIds.slice(i, i + batchSize)

      const response = await getEmojiCollectsByIdsApi({
        ids: batchIds,
      })

      if (response.result.collects.length > 0) {
        const collects = response.result.collects.map((collect: any) => ({
          uuid: collect.uuid,
          userId: collect.userId,
          emojiId: collect.emojiId,
          version: collect.version,
          createdAt: collect.createdAt ?? collect.createAt,
          updatedAt: collect.updatedAt ?? collect.updateAt,
        }))

        await EmojiCollectService.batchCreate(collects)
        syncedCollects.push(...collects.map(collect => ({
          collectId: collect.collectId,
          version: collect.version,
        })))
      }
    }

    // 发送通知
    if (syncedCollects.length > 0) {
      sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_COLLECT_UPDATE, {
        updatedCollects: syncedCollects,
      })
    }
  }
}

// 导出单例实例
export const collectSync = new CollectSync()
