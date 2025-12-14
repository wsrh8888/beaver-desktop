import type { QueueItem } from '../base/base'
import { getEmojiPackageContentsByPackageIdsApi } from 'mainModule/api/emoji'
import { EmojiPackageEmojiService } from 'mainModule/database/services/emoji/package-emoji'
import { BaseBusiness } from '../base/base'

/**
 * 表情包表情关联同步队列项
 */
interface PackageEmojiSyncItem extends QueueItem {
  emojiIds: string[]
  packageIds: string[]
}

/**
 * 表情包表情关联业务逻辑
 */
export class EmojiPackageEmojiBusiness extends BaseBusiness<PackageEmojiSyncItem> {
  protected readonly businessName = 'EmojiPackageEmojiBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 表情包表情关联同步请求较少
      delayMs: 1000, // 1秒延迟批量处理
    })
  }
  async getEmojisByPackageIds(packageIds: string[]) {
    return await EmojiPackageEmojiService.getEmojisByPackageIds(packageIds)
  }

  /**
   * 处理表情包表情关联表的更新通知
   */
  async handleTableUpdates(version: number, emojiId: string, packageId: string) {
    this.addToQueue({
      key: `emoji_package_emoji_${emojiId}_${packageId}_${version}`,
      data: { version, emojiId, packageId },
      timestamp: Date.now(),
      emojiIds: [emojiId],
      packageIds: [packageId],
    })
  }

  /**
   * 批量处理表情包表情关联同步请求
   */
  protected async processBatchRequests(items: PackageEmojiSyncItem[]): Promise<void> {
    // 按packageId聚合处理
    const packageMap = new Map<string, string[]>()

    for (const item of items) {
      for (const packageId of item.packageIds) {
        const existing = packageMap.get(packageId) || []
        existing.push(...item.emojiIds)
        packageMap.set(packageId, existing)
      }
    }

    // 为每个表情包处理关联数据
    for (const [packageId, emojiIds] of packageMap.entries()) {
      const uniqueEmojiIds = [...new Set(emojiIds)]

      if (uniqueEmojiIds.length === 0) {
        continue
      }

      try {
        // 获取表情包内容详情
        const response = await getEmojiPackageContentsByPackageIdsApi({
          packageIds: [packageId],
        })

        if (response.result?.contents && response.result.contents.length > 0) {
          // 过滤出需要的表情关联数据
          const contents = response.result.contents.filter(content =>
            uniqueEmojiIds.includes(content.emojiId)
          )

          if (contents.length > 0) {
            // 更新本地数据库
            const contentRows = contents.map((contentData: any) => ({
              relationId: contentData.relationId || `${packageId}_${contentData.emojiId}`,
              packageId: contentData.packageId,
              emojiId: contentData.emojiId,
              sortOrder: contentData.sortOrder,
              version: contentData.version,
              createAt: contentData.createdAt,
              updateAt: contentData.updatedAt,
            }))

            await EmojiPackageEmojiService.batchCreate(contentRows)
          }
        }
      } catch (error) {
        console.error('批量同步表情包表情关联失败:', error)
      }
    }
  }
}

// 导出单例实例
export const emojiPackageEmojiBusiness = new EmojiPackageEmojiBusiness()
