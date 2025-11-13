import type { IFriendListReq, IFriendListRes, IFriendInfo } from 'commonModule/type/ajax/friend'
import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { UserService } from 'mainModule/database/services/user/user'

// 生成会话ID的辅助函数
function generateConversationId(userId1: string, userId2: string): string {
  // 确保 userId1 < userId2，保证唯一性
  const sortedIds = [userId1, userId2].sort()
  return `private_${sortedIds[0]}_${sortedIds[1]}`
}

/**
 * 好友业务逻辑
 * 对应 friends 表
 * 负责好友管理的业务逻辑
 */
export class FriendBusiness {
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
        nickname: friendUser?.nickName || '',
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
}

// 导出单例实例
export const friendBusiness = new FriendBusiness()
