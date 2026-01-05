import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojisListRes } from 'commonModule/type/ajax/emoji'
import type { QueueItem } from '../base/base'
import { getEmojiCollectsByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiCollect  from 'mainModule/database/services/emoji/collect'
import dBServiceEmoji  from 'mainModule/database/services/emoji/emoji'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

const ensureLogin = (header: ICommonHeader) => {
  if (!header.userId)
    throw new Error('用户未登录')
}

/**
 * 表情收藏同步队列项
 */
interface FavoriteEmojiSyncItem extends QueueItem {
  emojiCollectIds: string[]
}

/**
 * 表情收藏业务逻辑
 */
class FavoriteEmojiBusiness extends BaseBusiness<FavoriteEmojiSyncItem> {
  protected readonly businessName = 'FavoriteEmojiBusiness'

  constructor() {
    super({
      queueSizeLimit: 30, // 表情收藏同步请求适中
      delayMs: 1000, // 1秒延迟批量处理
    })
  }
  async getUserFavoriteEmojis(header: ICommonHeader): Promise<IGetEmojisListRes> {
    ensureLogin(header)
    const collects = await dBServiceEmojiCollect.getCollectsByUserId({ userId: header.userId })
    const validCollects = collects.filter((item: any) => !item.isDeleted)
    const emojiIds = validCollects.map((item: any) => item.emojiId)
    const emojiMap = await dBServiceEmoji.getEmojisByIds({ ids: emojiIds })

    const list = validCollects
      .map((item: any) => {
        const emoji = emojiMap.get(item.emojiId)
        if (!emoji)
          return null
        return {
          emojiId: emoji.emojiId,
          fileKey: emoji.fileKey,
          title: emoji.title,
          emojiInfo: emoji.emojiInfo ? JSON.parse(emoji.emojiInfo) : null,
          packageId: item.packageId, // 使用收藏记录中的表情包ID
        }
      })
      .filter(Boolean) as IGetEmojisListRes['list']

    return { count: list.length, list }
  }

  /**
   * 处理表情收藏表的更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleTableUpdates(version: number, emojiCollectId: string, userId: string) {
    this.addToQueue({
      key: `emoji_collect_${emojiCollectId}_${version}`,
      data: { version, emojiCollectId, userId },
      timestamp: Date.now(),
      emojiCollectIds: [emojiCollectId],
    })
  }

  /**
   * 批量处理表情收藏同步请求
   */
  protected async processBatchRequests(items: FavoriteEmojiSyncItem[]): Promise<void> {
    // 聚合所有表情收藏ID
    const allCollectIds = [...new Set(items.flatMap(item => item.emojiCollectIds))]

    if (allCollectIds.length === 0) {
      return
    }

    try {
      // 直接用表情收藏ID获取完整的数据
      const response = await getEmojiCollectsByIdsApi({
        ids: allCollectIds,
      })

      if (response.result?.collects && response.result.collects.length > 0) {
        // 更新本地数据库 - 表情收藏表
        const collectRows = response.result.collects.map((collectData: any) => ({
          emojiCollectId: collectData.emojiCollectId,
          userId: collectData.userId,
          emojiId: collectData.emojiId,
          packageId: collectData.packageId,
          version: collectData.version,
          createdAt: collectData.createdAt,
          updatedAt: collectData.updatedAt,
        }))

        await dBServiceEmojiCollect.batchCreate({ collects: collectRows })

        // 发送通知到render进程，告知表情收藏数据已更新
        if (collectRows.length > 0) {
          sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_COLLECT_UPDATE, {
            updatedCollects: collectRows.map(collect => ({
              emojiCollectId: collect.emojiCollectId,
              version: collect.version,
            })),
          })
        }
      }
    } catch (error) {
      console.error('批量同步表情收藏失败:', error)
    }
  }
}

// 导出单例实例
export default new FavoriteEmojiBusiness()
