import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncFriendVerifiesApi } from 'mainModule/api/datasync'
import { getFriendVerifiesListByIdsApi } from 'mainModule/api/friened'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { FriendVerifyService } from 'mainModule/database/services/friend/friend_verify'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 好友验证数据同步模块
export class FriendVerifySyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await DataSyncService.get('friend_verifies')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的好友验证版本信息
      const serverResponse = await datasyncGetSyncFriendVerifiesApi({ since: lastSyncTime })

      console.error('22222222222222222222222222', localCursor, lastSyncTime)
      console.error(serverResponse)
      if (serverResponse.result.friendVerifyVersions.length > 0) {
        // 有变更的好友验证，需要同步数据
        await this.syncFriendVerifyData(serverResponse.result.friendVerifyVersions)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...serverResponse.result.friendVerifyVersions.map(item => item.version))
        await this.updateFriendVerifiesCursor(maxVersion, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有变更，将version设为null表示没有新数据
        await this.updateFriendVerifiesCursor(null, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '好友验证同步失败', data: { error: (error as any)?.message } }, 'FriendVerifySyncModule')
    }
  }

  // 同步好友验证数据
  async syncFriendVerifyData(friendVerifyVersions: any[]) {
    logger.info({ text: '开始同步好友验证数据', data: { count: friendVerifyVersions.length } }, 'FriendVerifySyncModule')

    // 提取所有变更的好友验证UUID，过滤掉空字符串
    const uuids = friendVerifyVersions
      .map(item => item.uuid)
      .filter(uuid => uuid && uuid.trim() !== '')

    if (uuids.length === 0) {
      logger.info({ text: '没有有效的uuids需要同步' }, 'FriendVerifySyncModule')
      return
    }

    // 分批获取好友验证数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < uuids.length; i += batchSize) {
      const batchUuids = uuids.slice(i, i + batchSize)

      const response = await getFriendVerifiesListByIdsApi({
        uuids: batchUuids,
      })

      if (response.result.friendVerifies.length > 0) {
        const friendVerifies = response.result.friendVerifies.map((verify: any) => ({
          uuid: verify.uuid,
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
        await FriendVerifyService.batchCreate(friendVerifies)
      }
    }

    logger.info({ text: '好友验证数据同步完成', data: { totalCount: uuids.length } }, 'FriendVerifySyncModule')
  }

  // 更新游标
  private async updateFriendVerifiesCursor(version: number | null, updatedAt: number) {
    await DataSyncService.upsert({
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
