import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiCollectsByUuidsApi } from 'mainModule/api/emoji'
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

  // 对比本地数据，过滤出需要更新的收藏记录UUID
  private async compareAndFilterCollectVersions(collectVersions: any[]): Promise<string[]> {
    const uuids = collectVersions
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (uuids.length === 0) {
      return []
    }

    const existingRecordsMap = await EmojiCollectService.getCollectsByUuids(uuids)

    const needUpdateUuids = uuids.filter((uuid) => {
      const existingRecord = existingRecordsMap.get(uuid)
      const serverVersion = collectVersions.find(item => item.id === uuid)?.version || 0
      return !existingRecord || existingRecord.version < serverVersion
    })

    return needUpdateUuids
  }

  // 同步表情收藏数据
  private async syncEmojiCollectData(collectUuids: string[]) {
    if (collectUuids.length === 0) {
      return
    }

    const syncedCollects: Array<{ uuid: string, version: number }> = []

    const batchSize = 50
    for (let i = 0; i < collectUuids.length; i += batchSize) {
      const batchUuids = collectUuids.slice(i, i + batchSize)

      const response = await getEmojiCollectsByUuidsApi({
        uuids: batchUuids,
      })

      if (response.result.collects.length > 0) {
        const collects = response.result.collects.map((collect: any, index: number) => ({
          uuid: batchUuids[index],
          userId: collect.userId,
          emojiId: collect.emojiId,
          version: collect.version,
          createdAt: collect.createdAt,
          updatedAt: collect.updatedAt,
        }))

        await EmojiCollectService.batchCreate(collects)
        syncedCollects.push(...collects.map(collect => ({
          uuid: collect.uuid,
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
