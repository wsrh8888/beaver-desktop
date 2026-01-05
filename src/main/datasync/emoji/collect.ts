import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiCollectsByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiCollect  from 'mainModule/database/services/emoji/collect'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-emoji-collect')
// 表情收藏同步模块
class CollectSync {
  // 同步表情收藏数据（emoji_collect 表）
  async sync(collectVersions: any[]) {
    try {
    if (!collectVersions || collectVersions.length === 0) {
      return
    }

    // 过滤出需要更新的收藏记录ID
    const needUpdateCollectIds = await this.compareAndFilterCollectVersions(collectVersions)
    console.log('11111111111111111111111111111111')
    console.log('11111111111111111111111111111111')
    console.log('11111111111111111111111111111111')
    console.log('11111111111111111111111111111111')
    console.log('11111111111111111111111111111111')
    console.log('11111111111111111111111111111111')
    console.log(needUpdateCollectIds)
    console.log(collectVersions)

    if (needUpdateCollectIds.length > 0) {
      await this.syncEmojiCollectData(needUpdateCollectIds)
    }
    }
    catch (error) {
      logger.error({ text: '表情收藏数据同步失败1', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的收藏记录ID
  private async compareAndFilterCollectVersions(collectVersions: any[]): Promise<string[]> {
    try {
    const ids = collectVersions
      .map(item => item.emojiCollectId)
      .filter(id => id && id.trim() !== '')

    if (ids.length === 0) {
      return []
    }

    const existingRecordsMap = await dBServiceEmojiCollect.getCollectsByIds({ ids })

    const needUpdateIds = ids.filter((id) => {
      const existingRecord = existingRecordsMap.get(id)
      const serverVersion = collectVersions.find(item => (item.collemojiCollectIdectId) === id)?.version || 0
      return !existingRecord || existingRecord.version < serverVersion
    })

    return needUpdateIds
    }
    catch (error) {
      logger.error({ text: '表情收藏数据同步失败2', data: { error: (error as any)?.message } })
    }
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
        const collects = response.result.collects.map((collect: any, index: number) => ({
          emojiCollectId: collect.emojiCollectId ?? batchIds[index],
          userId: collect.userId,
          emojiId: collect.emojiId,
          emojiInfo: collect.emojiInfo ? JSON.stringify(collect.emojiInfo) : null,
          version: collect.version,
          createdAt: collect.createdAt ?? collect.createdAt,
          updatedAt: collect.updatedAt ?? collect.updatedAt,
        }))

        await dBServiceEmojiCollect.batchCreate({ collects })
        syncedCollects.push(...collects.map(collect => ({
          collectId: collect.emojiCollectId,
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
