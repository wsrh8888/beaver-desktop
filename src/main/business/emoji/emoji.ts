import type { QueueItem } from '../base/base'
import { getEmojisByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmoji  from 'mainModule/database/services/emoji/emoji'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 表情基础数据同步队列项
 */
interface EmojiSyncItem extends QueueItem {
  emojiIds: string[]
}

/**
 * 表情基础数据业务逻辑
 */
class EmojiBusiness extends BaseBusiness<EmojiSyncItem> {
  protected readonly businessName = 'EmojiBusiness'

  constructor() {
    super({
      queueSizeLimit: 50, // 表情同步请求适中
      delayMs: 1000, // 1秒延迟批量处理
    })
  }

  /**
   * 处理表情表的更新通知
   */
  async handleTableUpdates(version: number, emojiId: string) {
    this.addToQueue({
      key: `emoji_${emojiId}_${version}`,
      data: { version, emojiId },
      timestamp: Date.now(),
      emojiIds: [emojiId],
    })
  }

  /**
   * 批量处理表情同步请求
   */
  protected async processBatchRequests(items: EmojiSyncItem[]): Promise<void> {
    // 聚合所有表情ID
    const allEmojiIds = [...new Set(items.flatMap(item => item.emojiIds))]

    if (allEmojiIds.length === 0) {
      return
    }

    try {
      // 获取服务器上的最新表情数据
      const response = await getEmojisByIdsApi({
        ids: allEmojiIds,
      })

      if (response.result?.emojis && (response.result.emojis as any[]).length > 0) {
        // 构建表情数据
        const emojis = (response.result.emojis as any[]).map((emoji: any, index: number) => ({
          emojiId: allEmojiIds[index], // 使用请求中的ID确保对应
          fileKey: emoji.fileKey,
          title: emoji.title,
          emojiInfo: emoji.emojiInfo ? JSON.stringify(emoji.emojiInfo) : null,
          status: emoji.status,
          version: emoji.version,
          createdAt: emoji.createdAt,
          updatedAt: emoji.updatedAt,
        }))

        // 批量更新本地数据库
        await dBServiceEmoji.batchCreate(emojis)

        // 发送通知到render进程，告知表情数据已更新
        if (emojis.length > 0) {
          sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_UPDATE, {
            updatedEmojis: emojis.map(emoji => ({
              emojiId: emoji.emojiId,
              version: emoji.version,
            })),
          })
        }
      }
    } catch (error) {
      console.error('批量同步表情数据失败:', error)
    }
  }
}

// 导出单例实例
export const emojiBusiness = new EmojiBusiness()
