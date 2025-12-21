import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackageContentsByPackageIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackageEmoji  from 'mainModule/database/services/emoji/package-emoji'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-emoji-package-emoji')
// emoji_package_emoji 表同步处理器
class PackageEmojiSync {
  // 同步表情包内容数据（emoji_package_emoji 表）
  async sync(packageContentVersions: any[]) {
    try {
    if (!packageContentVersions || packageContentVersions.length === 0) {
      return
    }

    // 过滤出需要更新的表情包ID
    const needUpdatePackageIds = await this.compareAndFilterPackageContentVersions(packageContentVersions)

    if (needUpdatePackageIds.length > 0) {
      await this.syncEmojiPackageContentData(needUpdatePackageIds)
    }
    }
    catch (error) {
      logger.error({ text: '表情包内容数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的表情包内容
  private async compareAndFilterPackageContentVersions(packageContentVersions: any[]): Promise<string[]> {
    try {
    const packageIds = packageContentVersions
      .map(item => item.packageId)
      .filter(id => id && id.trim() !== '')

    if (packageIds.length === 0) {
      return []
    }

    // 对于表情包内容，我们需要检查表情包表情关联表的版本
    // 这里简化处理，直接同步所有变更的表情包内容
    return [...new Set(packageIds)]
    }
    catch (error) {
      logger.error({ text: '表情包内容版本对比失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  // 同步表情包内容数据
  private async syncEmojiPackageContentData(packageIds: string[]) {
    try {
    if (packageIds.length === 0) {
      return
    }

    const syncedPackageContents: Array<{ packageId: string, version: number }> = []

    const batchSize = 50
    for (let i = 0; i < packageIds.length; i += batchSize) {
      const batchIds = packageIds.slice(i, i + batchSize)

      const response = await getEmojiPackageContentsByPackageIdsApi({
        packageIds: batchIds,
      })

      if (response.result.contents.length > 0) {
        const contents = response.result.contents.map((content: any) => ({
          relationId: content.relationId, // 如果服务端没返回，自己生成
          packageId: content.packageId,
          emojiId: content.emojiId,
          sortOrder: content.sortOrder,
          version: content.version,
          createdAt: content.createdAt, // 注意这里用的是 createdAt，不是 createdAt
          updatedAt: content.updatedAt, // 注意这里用的是 updatedAt，不是 updatedAt
        }))

        await dBServiceEmojiPackageEmoji.batchCreate({ relations: contents })
        syncedPackageContents.push(...contents.map(content => ({
          packageId: content.packageId,
          version: content.version,
        })))
      }
    }

    // 发送通知
    if (syncedPackageContents.length > 0) {
      sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_CONTENT_UPDATE, {
        updatedPackageContents: syncedPackageContents,
      })
    }
    }
    catch (error) {
      logger.error({ text: '表情包内容数据同步失败', data: { error: (error as any)?.message } })
    }
  }
}

// 导出单例实例
export const packageEmojiSync = new PackageEmojiSync()
