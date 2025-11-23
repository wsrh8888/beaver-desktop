import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IFriendInfo, IFriendListReq, IFriendListRes } from 'commonModule/type/ajax/friend'
import type { QueueItem } from '../base/base'
import { NotificationFriendCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getFriendsListByUuidsApi } from 'mainModule/api/friened'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { UserService } from 'mainModule/database/services/user/user'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

// 生成会话ID的辅助函数
function generateConversationId(userId1: string, userId2: string): string {
  // 确保 userId1 < userId2，保证唯一性
  const sortedIds = [userId1, userId2].sort()
  return `private_${sortedIds[0]}_${sortedIds[1]}`
}

/**
 * 好友同步队列项
 */
interface FriendSyncItem extends QueueItem {
  userId: string
  uuid?: string
  version: number
}

/**
 * 好友业务逻辑
 * 对应 friends 表
 * 负责好友管理的业务逻辑
 */
export class FriendBusiness extends BaseBusiness<FriendSyncItem> {
  protected readonly businessName = 'FriendBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 好友同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 获取好友列表
   */
  async getFriendsList(header: ICommonHeader, params: IFriendListReq): Promise<IFriendListRes> {
    const { userId } = header
    const { page = 1, limit = 20 } = params

    // 调用服务层获取好友关系记录（纯数据库查询）
    const friendRelations = await FriendService.getFriendRelations(userId, { page, limit })

    if (friendRelations.length === 0) {
      return { list: [] }
    }

    // 业务逻辑：收集所有需要查询的用户ID
    const userIds = new Set<string>()
    friendRelations.forEach((relation: any) => {
      if (relation.sendUserId === userId) {
        userIds.add(relation.revUserId)
      }
      else {
        userIds.add(relation.sendUserId)
      }
    })

    // 业务逻辑：查询所有好友的用户信息
    const userIdsArray = Array.from(userIds)
    const userInfos = await UserService.getUsersBasicInfo(userIdsArray)

    // 业务逻辑：构建用户ID到用户信息的映射
    const userMap = new Map<string, any>()
    userInfos.forEach((user: any) => {
      userMap.set(user.userId, user)
    })

    // 业务逻辑：构建好友列表
    const friendList: IFriendInfo[] = friendRelations.map((relation: any) => {
      // 确定好友的用户ID
      const friendUserId = relation.sendUserId === userId
        ? relation.revUserId
        : relation.sendUserId

      // 获取好友用户信息
      const friendUser = userMap.get(friendUserId)

      // 确定备注信息
      const notice = relation.sendUserId === userId
        ? relation.sendUserNotice || ''
        : relation.revUserNotice || ''

      return {
        userId: friendUserId,
        nickName: friendUser?.nickName || '',
        avatar: friendUser?.avatar || '',
        abstract: friendUser?.abstract || '',
        notice,
        isFriend: true,
        conversationId: generateConversationId(userId, friendUserId),
        email: friendUser?.email || '',
        source: relation.source || '',
      }
    })

    return {
      list: friendList,
    }
  }

  /**
   * 处理好友表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, version: number, uuid?: string) {
    this.addToQueue({
      key: userId,
      data: { userId, uuid, version },
      timestamp: Date.now(),
      userId,
      uuid,
      version,
    })
  }

  /**
   * 批量处理好友同步请求
   */
  protected async processBatchRequests(items: FriendSyncItem[]): Promise<void> {
    // 检查是否有具体的 uuid
    const uuids = items.map(item => item.uuid).filter((uuid): uuid is string => Boolean(uuid))

    try {
      const response = await getFriendsListByUuidsApi({
        uuids,
      })

      if (response.result.friends && response.result.friends.length > 0) {
        // 更新本地数据库，转换数据类型
        for (const friend of response.result.friends) {
          const friendData = {
            uuid: friend.uuid,
            sendUserId: friend.sendUserId,
            revUserId: friend.revUserId,
            sendUserNotice: friend.sendUserNotice || '',
            revUserNotice: friend.revUserNotice || '',
            source: friend.source || '',
            isDeleted: friend.isDeleted ? 1 : 0, // 转换为整数
            version: friend.version || 0,
            createdAt: Math.floor(friend.createAt / 1000), // 转换为秒级时间戳
            updatedAt: Math.floor(friend.updateAt / 1000),
          }
          await FriendService.upsert(friendData)
        }

        console.log(`好友数据精确同步成功: uuids=${uuids.join(',')}, count=${response.result.friends.length}`)

        // 发送通知到render进程，告知好友数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_FRIEND, NotificationFriendCommand.FRIEND_UPDATE, {
          updatedFriends: response.result.friends.map((friend: any) => ({
            uuid: friend.uuid,
            sendUserId: friend.sendUserId,
            revUserId: friend.revUserId,
            version: friend.version,
          })),
        })
      }
    }
    catch (error) {
      console.error('精确同步好友数据失败:', error)
    }
  }

  /**
   * 根据好友关系UUID列表批量获取好友信息
   */
  async getFriendsByUuid(header: ICommonHeader, params: { uuids: string[] }): Promise<{ list: IFriendInfo[] }> {
    const { uuids } = params
    const { userId } = header

    // 调用服务层批量获取好友信息
    const friends = await FriendService.getFriendsByUuid(uuids, userId)

    return { list: friends }
  }
}

// 导出单例实例
export const friendBusiness = new FriendBusiness()
