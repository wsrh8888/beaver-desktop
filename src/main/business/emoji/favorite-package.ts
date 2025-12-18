import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojiPackagesRes } from 'commonModule/type/ajax/emoji'
import type { QueueItem } from '../base/base'
import { getEmojiPackageCollectsByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackage  from 'mainModule/database/services/emoji/package'
import dBServiceEmojiPackageCollect  from 'mainModule/database/services/emoji/package-collect'
import { BaseBusiness } from '../base/base'

const ensureLogin = (header: ICommonHeader) => {
  if (!header.userId)
    throw new Error('用户未登录')
}

/**
 * 表情包收藏同步队列项
 */
interface FavoritePackageSyncItem extends QueueItem {
  packageCollectIds: string[]
}

/**
 * 表情包收藏业务逻辑
 */
class FavoritePackageBusiness extends BaseBusiness<FavoritePackageSyncItem> {
  protected readonly businessName = 'FavoritePackageBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 表情包收藏同步请求较少
      delayMs: 1000, // 1秒延迟批量处理
    })
  }
  async getUserFavoritePackages(header: ICommonHeader): Promise<IGetEmojiPackagesRes> {
    ensureLogin(header)

    // 获取所有表情包
    const allPackages = await dBServiceEmojiPackage.getAllPackages({})

    // 获取用户的收藏记录，用于标记哪些表情包已收藏
    const collects = await dBServiceEmojiPackageCollect.getPackageCollectsByUserId({ userId: header.userId })
    const collectedPackageIds = new Set(
      collects.filter((item: any) => !item.isDeleted).map((item: any) => item.packageId)
    )

    const list = allPackages
      .map((pkg: any) => ({
        packageId: pkg.packageId,
        title: pkg.title,
        coverFile: pkg.coverFile,
        description: pkg.description || '',
        type: (pkg.type as any) || 'user',
        collectCount: 0,
        emojiCount: 0,
        isCollected: collectedPackageIds.has(pkg.packageId),
        isAuthor: pkg.userId === header.userId,
      }))
      .filter(Boolean) as IGetEmojiPackagesRes['list']

    return { count: list.length, list }
  }

  /**
   * 处理表情包收藏表的更新通知
   * 将同步请求加入队列，批量处理
   */
  async handleTableUpdates(version: number, packageCollectId: string, userId: string) {
    this.addToQueue({
      key: `emoji_package_collect_${packageCollectId}_${version}`,
      data: { version, packageCollectId, userId },
      timestamp: Date.now(),
      packageCollectIds: [packageCollectId],
    })
  }

  /**
   * 批量处理表情包收藏同步请求
   */
  protected async processBatchRequests(items: FavoritePackageSyncItem[]): Promise<void> {
    // 聚合所有表情包收藏ID
    const allCollectIds = [...new Set(items.flatMap(item => item.packageCollectIds))]

    if (allCollectIds.length === 0) {
      return
    }

    try {
      // 直接用表情包收藏ID获取完整的数据
      const response = await getEmojiPackageCollectsByIdsApi({
        ids: allCollectIds,
      })

      if (response.result?.collects && response.result.collects.length > 0) {
        // 更新本地数据库
        const collectRows = response.result.collects.map((collectData: any) => ({
          packageCollectId: collectData.packageCollectId,
          userId: collectData.userId,
          packageId: collectData.packageId,
          version: collectData.version,
          createdAt: collectData.createAt,
          updatedAt: collectData.updateAt,
        }))

        await dBServiceEmojiPackageCollect.batchCreate(collectRows)
      }
    } catch (error) {
      console.error('批量同步表情包收藏失败:', error)
    }
  }
}

// 导出单例实例
export default new FavoritePackageBusiness()
