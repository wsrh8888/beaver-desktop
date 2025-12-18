import { SyncStatus } from 'commonModule/type/datasync'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { datasyncGetSyncFriendsApi } from 'mainModule/api/datasync'
import { getFriendsListByIdsApi } from 'mainModule/api/friened'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceFriend  from 'mainModule/database/services/friend/friend'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'

const logger = new Logger('数据同步-friend')

// 好友数据同步模块
class FriendSyncModule {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    logger.info({ text: '开始同步好友数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地同步时间戳
      const localCursor = await dbServiceDataSync.get('friends')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的好友版本信息
      const serverResponse = await datasyncGetSyncFriendsApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的数据
      const needUpdateFriendshipIds = await this.compareAndFilterFriendVersions(serverResponse.result.friendVersions || [])
      console.log('211111111111111111111111111111')
      console.log('211111111111111111111111111111')
      console.log('211111111111111111111111111111')
      console.log('211111111111111111111111111111')
      console.log('211111111111111111111111111111')
      console.log(needUpdateFriendshipIds)
      if (needUpdateFriendshipIds.length > 0) {
        // 有需要更新的好友数据
        await this.syncFriendData(needUpdateFriendshipIds)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...(serverResponse.result.friendVersions || []).map(item => item.version))
        await this.updateFriendsCursor(maxVersion, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有需要更新的数据，直接更新时间戳
        await this.updateFriendsCursor(null, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '好友数据同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的好友关系ID
  private async compareAndFilterFriendVersions(friendVersions: any[]): Promise<string[]> {
    if (!friendVersions || friendVersions.length === 0) {
      return []
    }

    // 提取所有变更的好友关系ID，过滤掉空字符串
    const friendshipIds = friendVersions
    .map(item => item.friendId)
    .filter(id => id && id.trim() !== '')

    if (friendshipIds.length === 0) {
      return []
    }

    // 查询本地已存在的记录
    const existingFriendsMap = await dBServiceFriend.getFriendRecordsByIds(friendshipIds)

    // 过滤出需要更新的friendshipIds（本地不存在或版本号更旧的数据）
    const needUpdateFriendshipIds = friendshipIds.filter((id) => {
      const existingFriend = existingFriendsMap.get(id)
      const serverVersion = friendVersions.find(item => item.friendId === id)?.version || 0

      // 如果本地不存在，或服务器版本更新，则需要更新
      return !existingFriend || existingFriend.version < serverVersion
    })

    return needUpdateFriendshipIds
  }

  // 同步好友数据
  private async syncFriendData(friendshipIds: string[]) {
    if (friendshipIds.length === 0) {
      return
    }

    const syncedFriends: Array<{ friendId: string, version: number }> = []

    // 分批获取好友数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < friendshipIds.length; i += batchSize) {
      const batchIds = friendshipIds.slice(i, i + batchSize)

      const response = await getFriendsListByIdsApi({
        friendIds: batchIds,
      })

      if (response.result.friends.length > 0) {
        const friends = response.result.friends.map((friend: any, index: number) => ({
          friendId: batchIds[index], // 使用请求中的ID
          sendUserId: friend.sendUserId,
          revUserId: friend.revUserId,
          sendUserNotice: friend.sendUserNotice,
          revUserNotice: friend.revUserNotice,
          source: friend.source,
          isDeleted: friend.isDeleted ? 1 : 0, // 转换为整数
          version: friend.version,
          createdAt: friend.createAt,
          updatedAt: friend.updateAt,
        }))

        await dBServiceFriend.batchCreate(friends)

        // 收集同步的数据用于通知
        syncedFriends.push(...friends.map(friend => ({
          friendId: friend.friendId,
          version: friend.version,
        })))
      }
    }

    // 发送通知到render进程，告知好友数据已同步
    if (syncedFriends.length > 0) {
      sendMainNotification('*', NotificationModule.DATABASE_FRIEND, NotificationFriendCommand.FRIEND_UPDATE, {
        updatedFriends: syncedFriends,
      })
    }
  }

  // 更新游标
  private async updateFriendsCursor(version: number | null, updatedAt: number) {
    await dbServiceDataSync.upsert({
      module: 'friends',
      version,
      updatedAt,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友同步模块实例
export const friendSyncModule = new FriendSyncModule()
