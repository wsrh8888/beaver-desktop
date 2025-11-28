import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackagesByIdsApi } from 'mainModule/api/emoji'
import { EmojiPackageService } from 'mainModule/database/services/emoji/package'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

// emoji_package 表同步处理器
class PackageSync {
  // 同步表情包基础数据（emoji_package 表）
  async sync(packageVersions: any[]) {
    if (!packageVersions || packageVersions.length === 0) {
      return
    }

    // 过滤出需要更新的表情包ID
    const needUpdatePackageIds = await this.compareAndFilterPackageVersions(packageVersions)

    if (needUpdatePackageIds.length > 0) {
      await this.syncEmojiPackageData(needUpdatePackageIds)
    }
  }

  // 对比本地数据，过滤出需要更新的表情包UUID
  private async compareAndFilterPackageVersions(packageVersions: any[]): Promise<string[]> {
    const packageIds = packageVersions
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (packageIds.length === 0) {
      return []
    }

    const existingPackagesMap = await EmojiPackageService.getPackagesByIds(packageIds)

    const needUpdatePackageIds = packageIds.filter((id) => {
      const existingPackage = existingPackagesMap.get(id)
      const serverVersion = packageVersions.find(item => item.id === id)?.version || 0
      return !existingPackage || existingPackage.version < serverVersion
    })

    return needUpdatePackageIds
  }

  // 同步表情包数据
  private async syncEmojiPackageData(packageIds: string[]) {
    if (packageIds.length === 0) {
      return
    }

    const syncedPackages: Array<{ id: string, version: number }> = []

    const batchSize = 50
    for (let i = 0; i < packageIds.length; i += batchSize) {
      const batchIds = packageIds.slice(i, i + batchSize)

      const response = await getEmojiPackagesByIdsApi({
        ids: batchIds,
      })

      if (response.result.packages.length > 0) {
        const packages = response.result.packages.map((pkg: any, index: number) => ({
          id: batchIds[index],
          uuid: pkg.uuid,
          title: pkg.title,
          coverFile: pkg.coverFile,
          userId: pkg.userId,
          description: pkg.description,
          type: pkg.type,
          status: pkg.status,
          version: pkg.version,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        }))

        await EmojiPackageService.batchCreate(packages)
        syncedPackages.push(...packages.map(pkg => ({
          id: pkg.id,
          version: pkg.version,
        })))
      }
    }

    // 发送通知
    if (syncedPackages.length > 0) {
      sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_UPDATE, {
        updatedPackages: syncedPackages,
      })
    }
  }
}

// 导出单例实例
export const packageSync = new PackageSync()
