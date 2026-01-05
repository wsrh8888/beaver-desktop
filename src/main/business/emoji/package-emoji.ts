import type { QueueItem } from '../base/base'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackageContentsByPackageIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackageEmoji  from 'mainModule/database/services/emoji/package-emoji'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 表情包表情关联同步队列项
 */
interface PackageEmojiSyncItem extends QueueItem {
  relationIds: string[]
}

/**
 * 表情包表情关联业务逻辑
 */
class EmojiPackageEmojiBusiness extends BaseBusiness<PackageEmojiSyncItem> {
  protected readonly businessName = 'EmojiPackageEmojiBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 表情包表情关联同步请求较少
      delayMs: 1000, // 1秒延迟批量处理
    })
  }
  async getEmojisByPackageIds(packageIds: string[]) {
    return await dBServiceEmojiPackageEmoji.getEmojisByPackageIds({ packageIds })
  }

  /**
   * 处理表情包表情关联表的更新通知
   */
  async handleTableUpdates(version: number, relationId: string) {
    this.addToQueue({
      key: `emoji_package_emoji_${relationId}_${version}`,
      data: { version, relationId },
      timestamp: Date.now(),
      relationIds: [relationId],
    })
  }

  /**
   * 批量处理表情包表情关联同步请求
   */
  protected async processBatchRequests(items: PackageEmojiSyncItem[]): Promise<void> {
    // 聚合所有需要同步的relationIds
    const relationIds = [...new Set(items.flatMap(item => item.relationIds))]

    if (relationIds.length === 0) {
      return
    }

    try {
      // 首先尝试从本地数据库获取这些relationId对应的packageId
      const existingRelations = await dBServiceEmojiPackageEmoji.getEmojisByRelationIds({ relationIds })

      // 提取packageIds
      const packageIds = [...new Set(existingRelations.map(relation => relation.packageId))]

      if (packageIds.length > 0) {
        // 根据packageIds获取表情包内容详情
        const response = await getEmojiPackageContentsByPackageIdsApi({
          packageIds: packageIds,
        })

        if (response.result?.contents && response.result.contents.length > 0) {
          // 过滤出需要的表情关联数据
          const contents = response.result.contents.filter(content =>
            relationIds.includes(content.relationId)
          )

          if (contents.length > 0) {
            // 更新本地数据库
            const contentRows = contents.map((contentData: any) => ({
              relationId: contentData.relationId,
              packageId: contentData.packageId,
              emojiId: contentData.emojiId,
              sortOrder: contentData.sortOrder,
              version: contentData.version,
              createdAt: contentData.createdAt,
              updatedAt: contentData.updatedAt,
            }))

            await dBServiceEmojiPackageEmoji.batchCreate({ relations: contentRows })

            // 发送通知到render进程，告知表情包内容数据已同步
            sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_CONTENT_UPDATE, {
              updatedPackageContents: contentRows.map((content: any) => ({
                relationId: content.relationId,
                packageId: content.packageId,
                emojiId: content.emojiId,
                version: content.version,
              })),
            })
          }
        }
      }
    } catch (error) {
      console.error('批量同步表情包表情关联失败:', error)
    }
  }
}

// 导出单例实例
export default new EmojiPackageEmojiBusiness()
