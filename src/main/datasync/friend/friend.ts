import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncFriendsApi } from 'mainModule/api/datasync'
import { getFriendsListByFriendshipIdsApi } from 'mainModule/api/friened'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { FriendSyncStatusService } from 'mainModule/database/services/friend/sync-status'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 好友数据同步模块
export class FriendSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await DataSyncService.get('friends')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的好友版本信息
      const serverResponse = await datasyncGetSyncFriendsApi({ since: lastSyncTime })

      console.error('11111111111111111111111111')
      console.error(serverResponse)
      if (serverResponse.result.friendVersions.length > 0) {
        // 有变更的好友，需要同步数据
        await this.syncFriendData(serverResponse.result.friendVersions)
        await this.updateFriendsCursor(userId, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有变更，将version设为null表示没有新数据
        await this.updateFriendsCursor(userId, null)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '好友同步失败', data: { error: (error as any)?.message } }, 'FriendSyncModule')
    }
  }

  // 同步好友数据
  async syncFriendData(friendVersions: any[]) {
    logger.info({ text: '开始同步好友数据', data: { count: friendVersions.length } }, 'FriendSyncModule')

    // 提取所有变更的好友关系ID，过滤掉空字符串
    const friendshipIds = friendVersions
      .map(item => item.friendshipId)
      .filter(id => id && id.trim() !== '')

    if (friendshipIds.length === 0) {
      logger.info({ text: '没有有效的friendshipIds需要同步' }, 'FriendSyncModule')
      return
    }

    // 分批获取好友数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < friendshipIds.length; i += batchSize) {
      const batchIds = friendshipIds.slice(i, i + batchSize)

      const response = await getFriendsListByFriendshipIdsApi({
        friendshipIds: batchIds,
      })

      if (response.result.friends.length > 0) {
        const friends = response.result.friends.map((friend: any) => ({
          friendshipId: friend.friendshipId,
          sendUserId: friend.sendUserId,
          revUserId: friend.revUserId,
          sendUserNotice: friend.sendUserNotice,
          revUserNotice: friend.revUserNotice,
          source: friend.source,
          isDeleted: friend.isDeleted,
          version: friend.version,
          createdAt: friend.createAt,
          updatedAt: friend.updateAt,
        }))

        // 批量插入好友数据
        await FriendService.batchCreate(friends)

        // 更新同步状态
        for (const friend of response.result.friends) {
          await FriendSyncStatusService.upsertFriendSyncStatus(friend.friendshipId, friend.version)
        }
      }
    }

    logger.info({ text: '好友数据同步完成', data: { totalCount: friendshipIds.length } }, 'FriendSyncModule')
  }

  // 更新游标
  private async updateFriendsCursor(userId: string, lastVersion: number | null) {
    await DataSyncService.upsert({
      module: 'friends',
      version: lastVersion,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友同步模块实例
export const friendSyncModule = new FriendSyncModule()
