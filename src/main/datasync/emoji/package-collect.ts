import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackageCollectsByUuidsApi } from 'mainModule/api/emoji'
import { EmojiPackageCollectService } from 'mainModule/database/services/emoji/package-collect'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

// emoji_package_collect 表同步处理器
class PackageCollectSync {
  // 同步表情包收藏数据（emoji_package_collect 表）
  async sync(packageCollectVersions: any[]) {
    if (!packageCollectVersions || packageCollectVersions.length === 0) {
      return
    }

    // 过滤出需要更新的收藏记录UUID
    const needUpdatePackageCollectUuids = await this.compareAndFilterPackageCollectVersions(packageCollectVersions)

    if (needUpdatePackageCollectUuids.length > 0) {
      await this.syncEmojiPackageCollectData(needUpdatePackageCollectUuids)
    }
  }

  // 对比本地数据，过滤出需要更新的收藏记录UUID
  private async compareAndFilterPackageCollectVersions(packageCollectVersions: any[]): Promise<string[]> {
    const uuids = packageCollectVersions
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (uuids.length === 0) {
      return []
    }

    const existingRecordsMap = await EmojiPackageCollectService.getPackageCollectsByUuids(uuids)

    const needUpdateUuids = uuids.filter((uuid) => {
      const existingRecord = existingRecordsMap.get(uuid)
      const serverVersion = packageCollectVersions.find(item => item.id === uuid)?.version || 0
      return !existingRecord || existingRecord.version < serverVersion
    })

    return needUpdateUuids
  }

  // 同步表情包收藏数据
  private async syncEmojiPackageCollectData(packageCollectUuids: string[]) {
    if (packageCollectUuids.length === 0) {
      return
    }

    const syncedPackageCollects: Array<{ uuid: string, version: number }> = []

    const batchSize = 50
    for (let i = 0; i < packageCollectUuids.length; i += batchSize) {
      const batchUuids = packageCollectUuids.slice(i, i + batchSize)

      const response = await getEmojiPackageCollectsByUuidsApi({
        uuids: batchUuids,
      })

      if (response.result.collects.length > 0) {
        const collects = response.result.collects.map((collect: any, index: number) => ({
          uuid: batchUuids[index],
          userId: collect.userId,
          packageId: collect.packageId,
          version: collect.version,
          createdAt: collect.createdAt,
          updatedAt: collect.updatedAt,
        }))

        await EmojiPackageCollectService.batchCreate(collects)
        syncedPackageCollects.push(...collects.map(collect => ({
          uuid: collect.uuid,
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
}

// 导出单例实例
export const packageCollectSync = new PackageCollectSync()
