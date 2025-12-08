import { SyncStatus } from 'commonModule/type/datasync'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { datasyncGetSyncEmojisApi } from 'mainModule/api/datasync'
import { getEmojisByIdsApi } from 'mainModule/api/emoji'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { EmojiService } from 'mainModule/database/services/emoji/emoji'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'

const logger = new Logger('数据同步-emoji')

// 表情基础数据同步模块
export class EmojiSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    logger.info({ text: '开始同步表情基础数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await DataSyncService.get('emojis')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的表情版本信息
      const serverResponse = await datasyncGetSyncEmojisApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的数据
      const needUpdateEmojiIds = await this.compareAndFilterEmojiVersions(serverResponse.result.emojiVersions || [])

      if (needUpdateEmojiIds.length > 0) {
        // 有需要更新的表情数据
        await this.syncEmojiData(needUpdateEmojiIds)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...(serverResponse.result.emojiVersions || []).map(item => item.version))
        await this.updateEmojisCursor(maxVersion, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有需要更新的数据，直接更新时间戳
        await this.updateEmojisCursor(null, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '表情基础数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的表情ID
  private async compareAndFilterEmojiVersions(emojiVersions: any[]): Promise<string[]> {
    if (!emojiVersions || emojiVersions.length === 0) {
      return []
    }

    // 提取所有变更的表情ID，过滤掉空字符串
    const emojiIds = emojiVersions
      .map(item => item.emojiId)
      .filter(id => id && id.trim() !== '')

    if (emojiIds.length === 0) {
      return []
    }

    // 查询本地已存在的记录
    const existingEmojisMap = await EmojiService.getEmojisByIds(emojiIds)

    // 过滤出需要更新的emojiIds（本地不存在或版本号更旧的数据）
    const needUpdateEmojiIds = emojiIds.filter((id) => {
      const existingEmoji = existingEmojisMap.get(id)
      const serverVersion = emojiVersions.find(item => item.emojiId === id)?.version || 0

      // 如果本地不存在，或服务器版本更新，则需要更新
      return !existingEmoji || existingEmoji.version < serverVersion
    })

    return needUpdateEmojiIds
  }

  // 同步表情数据
  private async syncEmojiData(emojiIds: string[]) {
    if (emojiIds.length === 0) {
      return
    }

    const syncedEmojis: Array<{ emojiId: string, version: number }> = []

    // 分批获取表情数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < emojiIds.length; i += batchSize) {
      const batchIds = emojiIds.slice(i, i + batchSize)

      const response = await getEmojisByIdsApi({
        ids: batchIds,
      })

      if (response.result.emojis.length > 0) {
        const emojis = response.result.emojis.map((emoji: any, index: number) => ({
          emojiId: batchIds[index], // 使用请求中的ID
          fileKey: emoji.fileKey,
          title: emoji.title,
          status: emoji.status,
          version: emoji.version,
          createdAt: emoji.createdAt,
          updatedAt: emoji.updatedAt,
        }))

        await EmojiService.batchCreate(emojis)

        // 收集同步的数据用于通知
        syncedEmojis.push(...emojis.map(emoji => ({
          emojiId: emoji.emojiId,
          version: emoji.version,
        })))
      }
    }

    // 发送通知到render进程，告知表情数据已同步
    if (syncedEmojis.length > 0) {
      sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_UPDATE, {
        updatedEmojis: syncedEmojis,
      })
    }
  }

  // 更新游标
  private async updateEmojisCursor(version: number | null, updatedAt: number) {
    await DataSyncService.upsert({
      module: 'emojis',
      version,
      updatedAt,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出表情同步模块实例
export const emojiSyncModule = new EmojiSyncModule()
