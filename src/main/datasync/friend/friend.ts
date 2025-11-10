import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncFriendsApi } from 'mainModule/api/datasync'
import { getFriendsListByUuidsApi } from 'mainModule/api/friened'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { FriendService } from 'mainModule/database/services/friend/friend'
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

      // 对比本地数据，过滤出需要更新的数据
      const needUpdateFriendshipIds = await this.compareAndFilterFriendVersions(serverResponse.result.friendVersions || [])

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
      logger.error({ text: '好友同步失败', data: { error: (error as any)?.message } }, 'FriendSyncModule')
    }
  }

  // 对比本地数据，过滤出需要更新的好友关系ID
  private async compareAndFilterFriendVersions(friendVersions: any[]): Promise<string[]> {
    if (!friendVersions || friendVersions.length === 0) {
      return []
    }

    // 提取所有变更的好友关系ID，过滤掉空字符串
    const friendshipIds = friendVersions
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (friendshipIds.length === 0) {
      return []
    }

    // 查询本地已存在的记录
    const existingFriendsMap = await FriendService.getFriendsByIds(friendshipIds)

    // 过滤出需要更新的friendshipIds（本地不存在或版本号更旧的数据）
    const needUpdateFriendshipIds = friendshipIds.filter((id) => {
      const existingFriend = existingFriendsMap.get(id)
      const serverVersion = friendVersions.find(item => item.id === id)?.version || 0

      // 如果本地不存在，或服务器版本更新，则需要更新
      return !existingFriend || existingFriend.version < serverVersion
    })

    logger.info({
      text: '好友版本对比结果',
      data: {
        total: friendshipIds.length,
        needUpdate: needUpdateFriendshipIds.length,
        skipped: friendshipIds.length - needUpdateFriendshipIds.length,
      },
    }, 'FriendSyncModule')

    return needUpdateFriendshipIds
  }

  // 同步好友数据
  private async syncFriendData(friendshipIds: string[]) {
    logger.info({ text: '开始同步好友数据', data: { count: friendshipIds.length } }, 'FriendSyncModule')

    if (friendshipIds.length === 0) {
      logger.info({ text: '没有有效的friendshipIds需要同步' }, 'FriendSyncModule')
      return
    }

    // 分批获取好友数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < friendshipIds.length; i += batchSize) {
      const batchIds = friendshipIds.slice(i, i + batchSize)

      console.error('API请求friendshipIds:', batchIds)
      const response = await getFriendsListByUuidsApi({
        uuids: batchIds,
      })
      console.error('API响应:', JSON.stringify(response))

      if (response.result.friends.length > 0) {
        const friends = response.result.friends.map((friend: any, index: number) => ({
          uuid: batchIds[index], // 使用请求中的UUID
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

        console.error('准备批量插入好友数据:', friends.length, '条')
        console.error('第一条数据:', JSON.stringify(friends[0]))
        await FriendService.batchCreate(friends)
        console.error('好友数据插入成功')
      }
    }

    logger.info({ text: '好友数据同步完成', data: { totalCount: friendshipIds.length } }, 'FriendSyncModule')
  }

  // 更新游标
  private async updateFriendsCursor(version: number | null, updatedAt: number) {
    console.error('更新friends游标:', { version, updatedAt })
    await DataSyncService.upsert({
      module: 'friends',
      version,
      updatedAt,
    })
    console.error('friends游标更新完成')
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出好友同步模块实例
export const friendSyncModule = new FriendSyncModule()
