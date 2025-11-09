import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncFriendsApi } from 'mainModule/api/datasync'
import { getFriendsListByFriendshipIdsApi } from 'mainModule/api/friened'
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

      console.error('11111111111111111111111111')
      console.error(JSON.stringify(serverResponse))
      if (serverResponse.result.friendVersions.length > 0) {
        // 有变更的好友，需要同步数据
        await this.syncFriendData(serverResponse.result.friendVersions)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...serverResponse.result.friendVersions.map(item => item.version))
        console.error('计算得到maxVersion:', maxVersion, 'serverTimestamp:', serverResponse.result.serverTimestamp)
        await this.updateFriendsCursor(maxVersion, serverResponse.result.serverTimestamp)
      }
      else {
        // 没有变更，将version设为null表示没有新数据
        await this.updateFriendsCursor(null, serverResponse.result.serverTimestamp)
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
      .map(item => item.id)
      .filter(id => id && id.trim() !== '')

    if (friendshipIds.length === 0) {
      logger.info({ text: '没有有效的friendshipIds需要同步' }, 'FriendSyncModule')
      return
    }

    // 分批获取好友数据（避免一次性获取过多数据）
    const batchSize = 50
    for (let i = 0; i < friendshipIds.length; i += batchSize) {
      const batchIds = friendshipIds.slice(i, i + batchSize)

      console.error('API请求friendshipIds:', batchIds)
      const response = await getFriendsListByFriendshipIdsApi({
        friendshipIds: batchIds,
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
