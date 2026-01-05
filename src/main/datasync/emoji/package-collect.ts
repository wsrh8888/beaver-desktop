import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackageCollectsByIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackageCollect  from 'mainModule/database/services/emoji/package-collect'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-emoji-package-collect')
// emoji_package_collect 表同步处理器
class PackageCollectSync {
  // 同步表情包收藏数据（emoji_package_collect 表）
  async sync(packageCollectVersions: any[]) {
    try {
    if (!packageCollectVersions || packageCollectVersions.length === 0) {
      return
    }

    // 过滤出需要更新的收藏记录ID
    const needUpdatePackageCollectIds = await this.compareAndFilterPackageCollectVersions(packageCollectVersions)

    if (needUpdatePackageCollectIds.length > 0) {
      await this.syncEmojiPackageCollectData(needUpdatePackageCollectIds)
    }
    }
    catch (error) {
      logger.error({ text: '表情包收藏数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的收藏记录ID
  private async compareAndFilterPackageCollectVersions(packageCollectVersions: any[]): Promise<string[]> {
    try {
    const ids = packageCollectVersions
      .map(item => item.packageCollectId)
      .filter(id => id && id.trim() !== '')

    if (ids.length === 0) {
      return []
    }

    const existingRecordsMap = await dBServiceEmojiPackageCollect.getPackageCollectsByIds({ ids })

    const needUpdateIds = ids.filter((id) => {
      const existingRecord = existingRecordsMap.get(id)
      const serverVersion = packageCollectVersions.find(item => item.packageCollectId === id)?.version || 0
      return !existingRecord || existingRecord.version < serverVersion
    })

      return needUpdateIds
    }
    catch (error) {
      logger.error({ text: '表情包收藏数据同步失败2', data: { error: (error as any)?.message } })
    }
  }

  // 同步表情包收藏数据
  private async syncEmojiPackageCollectData(packageCollectIds: string[]) {
    try {
    if (packageCollectIds.length === 0) {
      return
    }

    const syncedPackageCollects: Array<{ packageCollectId: string, version: number }> = []

    const batchSize = 50
    for (let i = 0; i < packageCollectIds.length; i += batchSize) {
      const batchIds = packageCollectIds.slice(i, i + batchSize)

      const response = await getEmojiPackageCollectsByIdsApi({
        ids: batchIds,
      })

      if (response.result.collects.length > 0) {
        const collects = response.result.collects.map((collect: any, index: number) => ({
          packageCollectId: batchIds[index],
          userId: collect.userId,
          packageId: collect.packageId,
          version: collect.version,
          createdAt: collect.createdAt,
          updatedAt: collect.updatedAt,
        }))

        await dBServiceEmojiPackageCollect.batchCreate({ collects })
        syncedPackageCollects.push(...collects.map(collect => ({
          packageCollectId: collect.packageCollectId,
          version: collect.version,
        })))
      }
    }

    // 发送通知
    if (syncedPackageCollects.length > 0) {
      sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_COLLECT_UPDATE, {
        updatedPackageCollects: syncedPackageCollects,
      })
    }
    }
    catch (error) {
      logger.error({ text: '表情包收藏数据同步失败3', data: { error: (error as any)?.message } })
    }
  }
}

// 导出单例实例
export const packageCollectSync = new PackageCollectSync()
