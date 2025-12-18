import { SyncStatus } from 'commonModule/type/datasync'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { datasyncGetSyncFriendVerifiesApi } from 'mainModule/api/datasync'
import { getFriendVerifiesListByIdsApi } from 'mainModule/api/friened'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceFriendVerify  from 'mainModule/database/services/friend/friend_verify'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'

const logger = new Logger('数据同步-friend-verify')

// 好友验证数据同步模块
class FriendVerifySyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    logger.info({ text: '开始同步好友验证数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await dbServiceDataSync.get({ module: 'friend_verifies' })
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的好友验证版本信息
      const serverResponse = await datasyncGetSyncFriendVerifiesApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的数据
      const needUpdateUuids = await this.compareAndFilterFriendVerifyVersions(serverResponse.result.friendVerifyVersions || [])

      if (needUpdateUuids.length > 0) {
        // 有需要更新的好友验证数据
        await this.syncFriendVerifyData(needUpdateUuids)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...(serverResponse.result.friendVerifyVersions || []).map(item => item.version))
        await this.updateFriendVerifiesCursor(maxVersion, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有需要更新的数据，直接更新时间戳
        await this.updateFriendVerifiesCursor(null, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '好友验证数据同步失败 checkAndSync', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的好友验证ID
  private async compareAndFilterFriendVerifyVersions(friendVerifyVersions: any[]): Promise<string[]> {
    try {
    if (!friendVerifyVersions || friendVerifyVersions.length === 0) {
      return []
    }
    // 提取所有变更的好友验证ID，过滤掉空字符串
    const verifyIds = friendVerifyVersions
      .map(item => item.verifyId)
      .filter(id => id && id.trim() !== '')

    if (verifyIds.length === 0) {
      return []
    }

    // 查询本地已存在的记录
    const existingVerifiesMap = await dBServiceFriendVerify.getFriendVerifiesByIds({ verifyIds })

    // 过滤出需要更新的ID（本地不存在或版本号更旧的数据）
    const needUpdateVerifyIds = verifyIds.filter((id) => {
      const existingVerify = existingVerifiesMap.get(id)
      const serverVersion = friendVerifyVersions.find(item => item.verifyId === id)?.version || 0

      // 如果本地不存在，或服务器版本更新，则需要更新
      return !existingVerify || existingVerify.version < serverVersion
    })

    return needUpdateVerifyIds
    }
    catch (error) {
      logger.error({ text: '好友验证版本对比失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  // 同步好友验证数据
  private async syncFriendVerifyData(verifyIds: string[]) {
    try {
    if (verifyIds.length === 0) {
      return
    }

    const syncedVerifies: Array<{ verifyId: string, version: number }> = []

    // 分批获取好友验证数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < verifyIds.length; i += batchSize) {
      const batchVerifyIds = verifyIds.slice(i, i + batchSize)

      const response = await getFriendVerifiesListByIdsApi({
        verifyIds: batchVerifyIds,
      })

      if (response.result.friendVerifies.length > 0) {
        const friendVerifies = response.result.friendVerifies.map((verify: any) => ({
          verifyId: verify.verifyId,
          sendUserId: verify.sendUserId,
          revUserId: verify.revUserId,
          sendStatus: verify.sendStatus,
          revStatus: verify.revStatus,
          message: verify.message,
          source: verify.source,
          version: verify.version,
          createdAt: verify.createAt,
          updatedAt: verify.updateAt,
        }))

        // 批量插入好友验证数据
        await dBServiceFriendVerify.batchCreate({ verifies: friendVerifies })

        // 收集同步的数据用于通知
        syncedVerifies.push(...friendVerifies.map(verify => ({
          verifyId: verify.verifyId,
          version: verify.version,
        })))
      }
    }

    // 发送通知到render进程，告知好友验证数据已同步
    if (syncedVerifies.length > 0) {
      sendMainNotification('*', NotificationModule.DATABASE_FRIEND, NotificationFriendCommand.FRIEND_VALID_UPDATE, {
        updatedVerifies: syncedVerifies,
      })
    }
    }
    catch (error) {
      logger.error({ text: '好友验证数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 更新游标
  private async updateFriendVerifiesCursor(version: number | null, updatedAt: number) {
    await dbServiceDataSync.upsert({
      module: 'friend_verifies',
      version,
      updatedAt,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友验证同步模块实例
export const friendVerifySyncModule = new FriendVerifySyncModule()
