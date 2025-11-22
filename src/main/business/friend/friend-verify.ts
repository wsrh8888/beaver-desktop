import type { QueueItem } from '../base/base'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getFriendVerifiesListByIdsApi } from 'mainModule/api/friened'
import { FriendVerifyService } from 'mainModule/database/services/friend/friend_verify'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import { BaseBusiness } from '../base/base'

/**
 * 好友验证同步队列项
 */
interface FriendVerifySyncItem extends QueueItem {
  userId: string
  uuid: string
  version: number
}

/**
 * 好友验证业务逻辑
 * 对应 friend_verify 表
 * 负责好友验证管理的业务逻辑
 */
export class FriendVerifyBusiness extends BaseBusiness<FriendVerifySyncItem> {
  protected readonly businessName = 'FriendVerifyBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 好友验证同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 根据验证记录UUID列表批量查询验证记录
   */
  async getValidByUuid(uuids: string[]): Promise<{ list: any[] }> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    return await FriendVerifyService.getValidByUuid(uuids, userStore.userId)
  }

  /**
   * 处理好友验证表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, uuid: string, version: number) {
    this.addToQueue({
      key: `${userId}:${uuid}`,
      data: { userId, uuid, version },
      timestamp: Date.now(),
      userId,
      uuid,
      version,
    })
  }

  /**
   * 批量处理好友验证同步请求
   */
  protected async processBatchRequests(items: FriendVerifySyncItem[]): Promise<void> {
    // 直接调用API获取好友验证数据
    const uuids = items.map(item => item.data.uuid).filter(Boolean)

    if (uuids.length === 0) {
      return
    }

    try {
      // 直接调用API获取指定UUID的好友验证数据
      const response = await getFriendVerifiesListByIdsApi({
        uuids,
      })

      if (response.result.friendVerifies && response.result.friendVerifies.length > 0) {
        const friendVerifies = response.result.friendVerifies.map((verify: any) => ({
          uuid: verify.uuid,
          sendUserId: verify.sendUserId,
          revUserId: verify.revUserId,
          message: verify.message,
          source: verify.source,
          revStatus: verify.revStatus,
          version: verify.version,
          createdAt: verify.createdAt,
          updatedAt: verify.updatedAt,
        }))

        // 批量创建/更新本地数据库
        await FriendVerifyService.batchCreate(friendVerifies)
        console.log(`好友验证同步成功: count=${friendVerifies.length}`)

        // 发送通知到render进程，告知好友验证数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_FRIEND, NotificationFriendCommand.FRIEND_VALID_UPDATE, {
          updatedVerifies: friendVerifies.map((verify: any) => ({
            uuid: verify.uuid,
            sendUserId: verify.sendUserId,
            revUserId: verify.revUserId,
            version: verify.version,
          })),
        })
      }
    }
    catch (error) {
      console.error('批量同步好友验证数据失败:', error)
    }
  }
}

// 导出单例实例
export const friendVerifyBusiness = new FriendVerifyBusiness()
