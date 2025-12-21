import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IValidInfo } from 'commonModule/type/ajax/friend'
import type { QueueItem } from '../base/base'
import dBServiceUser from 'mainModule/database/services/user/user'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getFriendVerifiesListByIdsApi } from 'mainModule/api/friened'
import dBServiceFriendVerify  from 'mainModule/database/services/friend/friend_verify'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import { BaseBusiness } from '../base/base'

/**
 * 好友验证同步队列项
 */
interface FriendVerifySyncItem extends QueueItem {
  userId: string
  verifyId: string
  version: number
}

/**
 * 好友验证业务逻辑
 * 对应 friend_verify 表
 * 负责好友验证管理的业务逻辑
 */
class FriendVerifyBusiness extends BaseBusiness<FriendVerifySyncItem> {
  protected readonly businessName = 'FriendVerifyBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 好友验证同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 根据验证记录ID列表批量查询验证记录
   */
  async getValidByIds(verifyIds: string[]): Promise<{ list: IValidInfo[] }> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    const { userId } = userStore
    if (verifyIds.length === 0) {
      return { list: [] }
    }

    try {
      // 调用数据库服务层获取验证记录
      const validRecords = await dBServiceFriendVerify.getValidByIds({
        verifyIds,
        currentUserId: userId
      })

      if (validRecords.length === 0) {
        return { list: [] }
      }

      // 收集需要查询的用户ID
      const userIds = new Set<string>()
      validRecords.forEach((record: any) => {
        userIds.add(record.sendUserId)
        userIds.add(record.revUserId)
      })

      // 调用用户服务获取用户信息
      const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds: Array.from(userIds) })

      // 构建用户映射
      const userMap = new Map<string, any>()
      userInfos.forEach((user: any) => {
        userMap.set(user.userId, user)
      })

      // 构建验证列表（业务逻辑）
      const validList: IValidInfo[] = validRecords.map((record: any) => {
        // 确定对方用户ID和用户信息
        const otherUserId = record.sendUserId === userId ? record.revUserId : record.sendUserId
        const otherUser = userMap.get(otherUserId)

        return {
          verifyId: record.verifyId,
          userId: otherUserId,
          nickName: otherUser?.nickName || '',
          avatar: otherUser?.avatar || '',
          message: record.message || '',
          flag: record.sendUserId === userId ? 'send' : 'receive', // 发送或接收标识
          status: record.sendUserId === userId ? record.sendStatus : record.revStatus,
          createdAt: new Date(record.createdAt * 1000).toISOString(),
        }
      })

      return { list: validList }
    } catch (error) {
      console.error('根据验证记录ID列表批量查询验证记录失败:', error)
      return { list: [] }
    }
  }

  /**
   * 获取有效的验证列表
   */
  async getValidList(header: ICommonHeader, params: any): Promise<{ list: IValidInfo[] }> {
    const { userId } = header
    const { page = 1, limit = 20 } = params

    if (!userId) {
      throw new Error('用户ID不能为空')
    }

    try {
      // 调用数据库服务层获取验证记录
      const validRecords = await dBServiceFriendVerify.getValidList({
        userId,
        page,
        limit
      })

      if (validRecords.length === 0) {
        return { list: [] }
      }

      // 收集需要查询的用户ID
      const userIds = new Set<string>()
      validRecords.forEach((record: any) => {
        userIds.add(record.sendUserId)
        userIds.add(record.revUserId)
      })

      // 调用用户服务获取用户信息
      const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds: Array.from(userIds) })

      // 构建用户映射
      const userMap = new Map<string, any>()
      userInfos.forEach((user: any) => {
        userMap.set(user.userId, user)
      })

      // 构建验证列表（业务逻辑）
      const validList: IValidInfo[] = validRecords.map((record: any) => {
        // 确定对方用户ID和用户信息
        const otherUserId = record.sendUserId === userId ? record.revUserId : record.sendUserId
        const otherUser = userMap.get(otherUserId)

        return {
          verifyId: record.verifyId,
          userId: otherUserId,
          nickName: otherUser?.nickName || '',
          avatar: otherUser?.avatar || '',
          message: record.message || '',
          flag: record.sendUserId === userId ? 'send' : 'receive', // 发送或接收标识
          status: record.sendUserId === userId ? record.revStatus : record.sendStatus,
          createdAt: new Date(record.createdAt * 1000).toISOString(),
        }
      })

      return { list: validList }
    } catch (error) {
      console.error('获取好友验证列表失败:', error)
      return { list: [] }
    }
  }

  /**
   * 根据版本范围获取有效的验证记录
   */
  async getValidByVerRange(header: ICommonHeader, params: any): Promise<{ list: IValidInfo[] }> {
    const { userId } = header
    const { startVersion = 0, endVersion = Number.MAX_SAFE_INTEGER } = params

    if (!userId) {
      throw new Error('用户ID不能为空')
    }

    try {
      // 调用数据库服务层获取验证记录
      const validRecords = await dBServiceFriendVerify.getValidByVerRange({
        userId,
        startVersion,
        endVersion
      })

      if (validRecords.length === 0) {
        return { list: [] }
      }

      // 收集需要查询的用户ID
      const userIds = new Set<string>()
      validRecords.forEach((record: any) => {
        userIds.add(record.sendUserId)
        userIds.add(record.revUserId)
      })

      // 调用用户服务获取用户信息
      const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds: Array.from(userIds) })

      // 构建用户映射
      const userMap = new Map<string, any>()
      userInfos.forEach((user: any) => {
        userMap.set(user.userId, user)
      })

      // 构建验证列表（业务逻辑）
      const validList: IValidInfo[] = validRecords.map((record: any) => {
        // 确定对方用户ID和用户信息
        const otherUserId = record.sendUserId === userId ? record.revUserId : record.sendUserId
        const otherUser = userMap.get(otherUserId)

        return {
          verifyId: record.verifyId,
          userId: otherUserId,
          nickName: otherUser?.nickName || '',
          avatar: otherUser?.avatar || '',
          message: record.message || '',
          flag: record.sendUserId === userId ? 'send' : 'receive', // 发送或接收标识
          status: record.sendUserId === userId ? record.sendStatus : record.revStatus,
          createdAt: new Date(record.createdAt * 1000).toISOString(),
        }
      })

      return { list: validList }
    } catch (error) {
      console.error('根据版本范围获取验证列表失败:', error)
      return { list: [] }
    }
  }

  /**
   * 处理好友验证表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, verifyId: string, version: number) {
    this.addToQueue({
      key: `${userId}:${verifyId}`,
      data: { userId, verifyId, version },
      timestamp: Date.now(),
      userId,
      verifyId,
      version,
    })
  }

  /**
   * 批量处理好友验证同步请求
   */
  protected async processBatchRequests(items: FriendVerifySyncItem[]): Promise<void> {
    // 直接调用API获取好友验证数据
    const verifyIds = items.map(item => item.data.verifyId).filter(Boolean)

    if (verifyIds.length === 0) {
      return
    }

    try {
      // 直接调用API获取指定ID的好友验证数据
      const response = await getFriendVerifiesListByIdsApi({
        verifyIds,
      })

      if (response.result.friendVerifies && response.result.friendVerifies.length > 0) {
        const friendVerifies = response.result.friendVerifies.map((verify: any) => ({
          verifyId: verify.verifyId,
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
        await dBServiceFriendVerify.batchCreate({ verifies: friendVerifies })
        console.log(`好友验证同步成功: count=${friendVerifies.length}`)

        // 发送通知到render进程，告知好友验证数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_FRIEND, NotificationFriendCommand.FRIEND_VALID_UPDATE, {
          updatedVerifies: friendVerifies.map((verify: any) => ({
            verifyId: verify.verifyId,
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
export default new FriendVerifyBusiness()
