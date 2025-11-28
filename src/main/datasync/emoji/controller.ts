import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncEmojiCollectsApi } from 'mainModule/api/datasync'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'
import { collectSync } from './collect'
import { packageSync } from './package'
import { packageCollectSync } from './package-collect'
import { packageEmojiSync } from './package-emoji'

const logger = new Logger('数据同步-表情控制器')

// 表情数据同步控制器（统一API调用和协调器）
class EmojiController {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步所有表情相关数据
  async checkAndSync() {
    logger.info({ text: '开始同步表情收藏数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await DataSyncService.get('emoji_collects')
      const lastSyncTime = localCursor?.version || 0

      // 一次性获取服务器上所有表情相关数据的变更版本信息
      const serverResponse = await datasyncGetSyncEmojiCollectsApi({ since: lastSyncTime })

      // 并行同步所有表情相关数据
      const syncTasks = [
        // emoji_collect 表同步
        collectSync.sync(serverResponse.result.emojiCollectVersions || []),
        // emoji_package_collect 表同步
        packageCollectSync.sync(serverResponse.result.emojiPackageCollectVersions || []),
        // emoji_package 表同步
        packageSync.sync(serverResponse.result.emojiPackageVersions || []),
        // emoji_package_emoji 表同步
        packageEmojiSync.sync(serverResponse.result.emojiPackageContentVersions || []),
      ]

      await Promise.all(syncTasks)

      // 更新同步时间戳（使用服务器返回的时间戳）
      await this.updateEmojiCollectsCursor(null, serverResponse.result.serverTimestamp)

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '表情收藏数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 更新游标
  private async updateEmojiCollectsCursor(version: number | null, updatedAt: number) {
    await DataSyncService.upsert({
      module: 'emoji_collects',
      version,
      updatedAt,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出单例实例
export const emojiController = new EmojiController()
