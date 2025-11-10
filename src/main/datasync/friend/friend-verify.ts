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

      console.log('获取服务器的数据信息', serverResponse)
      // 对比本地数据，过滤出需要更新的数据
      const needUpdateUuids = await this.compareAndFilterFriendVerifyVersions(serverResponse.result.friendVerifyVersions || [])
      console.log('获取实际需要更新的数据', needUpdateUuids)
      if (needUpdateUuids.length > 0) {
        // 有需要更新的好友验证数据
        await this.syncFriendVerifyData(needUpdateUuids)
        // 从变更的数据中找到最大的版本号
        const maxVersion = Math.max(...(serverResponse.result.friendVerifyVersions || []).map(item => item.version))
        await this.updateFriendVerifiesCursor(maxVersion, serverResponse.result.serverTimestamp)
        console.log('更新游标')
      }
      else {
        console.log('没有需要更新的数据，直接更新时间戳')
        // 没有需要更新的数据，直接更新时间戳
        await this.updateFriendVerifiesCursor(null, serverResponse.result.serverTimestamp)
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '好友验证同步失败', data: { error: (error as any)?.message } }, 'FriendVerifySyncModule')
    }
  }

  // 对比本地数据，过滤出需要更新的好友验证UUID
  private async compareAndFilterFriendVerifyVersions(friendVerifyVersions: any[]): Promise<string[]> {
    if (!friendVerifyVersions || friendVerifyVersions.length === 0) {
      return []
    }
    console.log('开始对比本地好友验证数据')
    // 提取所有变更的好友验证UUID，过滤掉空字符串
    const uuids = friendVerifyVersions
      .map(item => item.uuid)
      .filter(uuid => uuid && uuid.trim() !== '')

    if (uuids.length === 0) {
      return []
    }

    console.log('本地查询', JSON.stringify(uuids))
    // 查询本地已存在的记录
    const existingVerifiesMap = await FriendVerifyService.getFriendVerifiesByIds(uuids)
    console.log('本地查询完成', JSON.stringify(existingVerifiesMap))

    // 过滤出需要更新的uuids（本地不存在或版本号更旧的数据）
    const needUpdateUuids = uuids.filter((uuid) => {
      const existingVerify = existingVerifiesMap.get(uuid)
      const serverVersion = friendVerifyVersions.find(item => item.uuid === uuid)?.version || 0

      // 如果本地不存在，或服务器版本更新，则需要更新
      return !existingVerify || existingVerify.version < serverVersion
    })

    console.log('查询完成')

    logger.info({
      text: '好友验证版本对比结果',
      data: {
        total: uuids.length,
        needUpdate: needUpdateUuids.length,
        skipped: uuids.length - needUpdateUuids.length,
      },
    }, 'FriendVerifySyncModule')

    return needUpdateUuids
  }

  // 同步好友验证数据
  private async syncFriendVerifyData(uuids: string[]) {
    logger.info({ text: '开始同步好友验证数据', data: { count: uuids.length } }, 'FriendVerifySyncModule')

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
