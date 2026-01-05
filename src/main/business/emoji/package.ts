import type { QueueItem } from '../base/base'
import type { IGetEmojiPackageEmojisReq, IGetEmojiPackageEmojisRes, IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes } from 'commonModule/type/ajax/emoji'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackagesByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackageEmoji  from 'mainModule/database/services/emoji/package-emoji'
import dBServiceEmoji  from 'mainModule/database/services/emoji/emoji'
import dBServiceEmojiPackage  from 'mainModule/database/services/emoji/package'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 表情包同步队列项
 */
interface PackageSyncItem extends QueueItem {
  packageIds: string[]
}

class EmojiPackageBusiness extends BaseBusiness<PackageSyncItem> {
  protected readonly businessName = 'EmojiPackageBusiness'

  constructor() {
    super({
      queueSizeLimit: 20,
      delayMs: 1000,
    })
  }
  async getEmojiPackagesByIds(params: IGetEmojiPackagesByIdsReq): Promise<IGetEmojiPackagesByIdsRes> {
    const ids = params?.ids || []
    const packageMap = await dBServiceEmojiPackage.getPackagesByIds({ ids })

    const packages = ids
      .map((id) => {
        const pkg = packageMap.get(id)
        if (!pkg)
          return null
        return {
          packageId: pkg.packageId,
          title: pkg.title,
          coverFile: pkg.coverFile,
          userId: pkg.userId,
          description: pkg.description || '',
          type: pkg.type,
          status: pkg.status,
          collectCount: 0,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          version: pkg.version,
        }
      })
      .filter(Boolean) as IGetEmojiPackagesByIdsRes['packages']

    return { packages }
  }

  async getEmojiPackageEmojis(params: IGetEmojiPackageEmojisReq): Promise<IGetEmojiPackageEmojisRes> {
    const { packageId } = params
    console.log('getEmojiPackageEmojis called with packageId:', packageId)

    // 获取表情包关联数据
    const packageEmojis = await dBServiceEmojiPackageEmoji.getEmojisByPackageId({ packageId })
    console.log('packageEmojis found:', packageEmojis.length, packageEmojis)

    if (packageEmojis.length === 0) {
      return { list: [], total: 0 }
    }

    // 提取表情ID列表
    const emojiIds = packageEmojis.map(item => item.emojiId)
    console.log('emojiIds to query:', emojiIds)

    // 获取表情详情
    const emojiMap = await dBServiceEmoji.getEmojisByIds({ ids: emojiIds })
    console.log('emojiMap size:', emojiMap.size, 'keys:', Array.from(emojiMap.keys()))

    // 组装返回数据，按关联表的排序返回
    const list = packageEmojis
      .map(packageEmoji => {
        const emoji = emojiMap.get(packageEmoji.emojiId)

        // 如果表情详情不存在，创建基本信息（用于调试）
        if (!emoji) {
          console.warn(`表情 ${packageEmoji.emojiId} 详情不存在`)
          return {
            emojiId: packageEmoji.emojiId,
            name: `表情 ${packageEmoji.emojiId.slice(0, 8)}...`, // 临时名称
            icon: '', // 空图标
            version: packageEmoji.version || 0,
          }
        }

        return {
          emojiId: emoji.emojiId,
          name: emoji.title, // 将title映射为name
          icon: emoji.fileKey, // 将fileKey映射为icon
          version: emoji.version,
        }
      })

    return {
      list,
      total: list.length
    }
  }

  /**
   * 处理表情包表的更新通知
   */
  async handleTableUpdates(version: number, packageId: string) {
    this.addToQueue({
      key: `emoji_package_${packageId}_${version}`,
      data: { version, packageId },
      timestamp: Date.now(),
      packageIds: [packageId],
    })
  }

  /**
   * 批量处理表情包同步请求
   */
  protected async processBatchRequests(items: PackageSyncItem[]): Promise<void> {
    // 聚合所有需要同步的表情包ID
    const packageIds = [...new Set(items.flatMap(item => item.packageIds))]

    if (packageIds.length === 0) {
      return
    }

    try {
      // 获取表情包详情
      const response = await getEmojiPackagesByIdsApi({
        ids: packageIds,
      })

      if (response.result?.packages && response.result.packages.length > 0) {
        // 更新本地数据库
        const packageRows = response.result.packages.map((packageData: any) => ({
          packageId: packageData.packageId,
          title: packageData.title,
          coverFile: packageData.coverFile,
          userId: packageData.userId,
          description: packageData.description || '',
          type: packageData.type,
          status: packageData.status,
          collectCount: packageData.collectCount || 0,
          createdAt: packageData.createdAt,
          updatedAt: packageData.updatedAt,
          version: packageData.version,
        }))

        await dBServiceEmojiPackage.batchCreate({ packageList: packageRows })

        // 发送通知到render进程，告知表情包数据已同步
        sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_UPDATE, {
          updatedPackages: response.result.packages.map((pkg: any) => ({
            packageId: pkg.packageId,
            version: pkg.version,
          })),
        })
      }
    } catch (error) {
      console.error('批量同步表情包失败:', error)
    }
  }
}

export default new EmojiPackageBusiness()