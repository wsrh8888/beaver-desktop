import type { IFriendInfo } from 'commonModule/type/ajax/friend'
import { and, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { BaseService } from '../base'
import { friends } from 'mainModule/database/tables/friend/friend'
import { users } from 'mainModule/database/tables/user/user'
import type {
  DBCreateFriendReq,
  DBUpsertFriendReq,
  DBBatchCreateFriendsReq,
  DBGetFriendDetailsReq,
  DBGetFriendDetailsRes,
  DBGetFriendsByIdsReq,
  DBGetFriendsByIdsRes,
  DBGetFriendRecordsByIdsReq,
  DBGetFriendRecordsByIdsRes,
  DBGetFriendRelationsReq,
  DBGetFriendRelationsRes,
  DBGetFriendsByVerRangeReq,
  DBGetFriendsByVerRangeRes,
} from 'commonModule/type/database/server/friend/friend'

// 好友服务
class Friend extends BaseService {
  /**
   * @description 创建好友关系
   */
  async create(req: DBCreateFriendReq): Promise<void> {
    await this.db.insert(friends).values(req).run()
  }

  /**
   * @description 创建或更新好友关系（upsert操作）
   */
  async upsert(req: DBUpsertFriendReq): Promise<void> {
    await this.db.insert(friends)
      .values(req)
      .onConflictDoUpdate({
        target: friends.friendId,
        set: {
          sendUserId: req.sendUserId,
          revUserId: req.revUserId,
          sendUserNotice: req.sendUserNotice,
          revUserNotice: req.revUserNotice,
          source: req.source,
          isDeleted: req.isDeleted,
          version: req.version,
          updatedAt: req.updatedAt,
        },
      })
      .run()
  }

  /**
   * @description 批量获取好友详细信息（包含用户信息和备注）
   */
  async getFriendDetails(req: DBGetFriendDetailsReq): Promise<DBGetFriendDetailsRes> {
    const { userId, friendIds } = req
    if (friendIds.length === 0) {
      return new Map()
    }

    // 查询当前用户与指定好友的好友关系
    const friendRelations = await this.db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.sendUserId, userId as any), inArray(friends.revUserId, friendIds as any)),
          and(eq(friends.revUserId, userId as any), inArray(friends.sendUserId, friendIds as any)),
        ),
      )
      .all()

    if (friendRelations.length === 0) {
      return new Map()
    }

    // 收集需要查询的用户ID
    const userIdsToQuery = new Set<string>()
    friendRelations.forEach((relation: any) => {
      if (relation.sendUserId === userId) {
        userIdsToQuery.add(relation.revUserId)
      }
      else {
        userIdsToQuery.add(relation.sendUserId)
      }
    })

    // 查询用户信息
    const userIdsArray = Array.from(userIdsToQuery)
    const userInfos = await this.db
      .select({
        userId: users.userId,
        nickName: users.nickName,
        avatar: users.avatar,
        abstract: users.abstract,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.userId, userIdsArray))
      .all()

    // 构建用户信息的映射
    const userInfoMap = new Map<string, any>()
    userInfos.forEach((user: any) => {
      userInfoMap.set(user.userId, user)
    })

    // 构建好友关系的映射
    const friendRelationMap = new Map<string, any>()
    friendRelations.forEach((relation: any) => {
      if (relation.sendUserId === userId) {
        friendRelationMap.set(relation.revUserId, relation)
      }
      else {
        friendRelationMap.set(relation.sendUserId, relation)
      }
    })

    // 构建完整的返回值
    const friendDetailsMap = new Map<string, any>()

    for (const friendId of friendIds) {
      const userInfo = userInfoMap.get(friendId)
      const friendRelation = friendRelationMap.get(friendId)

      if (userInfo && friendRelation) {
        // 确定备注信息
        const notice = friendRelation.sendUserId === userId
          ? friendRelation.revUserNotice || ''
          : friendRelation.sendUserNotice || ''

        friendDetailsMap.set(friendId, {
          userId: userInfo.userId,
          nickName: userInfo.nickName || '',
          avatar: userInfo.avatar || '',
          abstract: userInfo.abstract || '',
          email: userInfo.email || '',
          notice,
          friendAt: friendRelation.createdAt,
        })
      }
    }

    return friendDetailsMap
  }

  /**
   * @description 根据好友关系ID列表批量查询好友信息
   */
  async getFriendsByIds(req: DBGetFriendsByIdsReq): Promise<DBGetFriendsByIdsRes> {
    const { friendIds, currentUserId } = req
    if (friendIds.length === 0) {
      return []
    }

    const friendRecords = await this.db
      .select()
      .from(friends)
      .where(inArray(friends.friendId, friendIds as any))
      .all()

    if (friendRecords.length === 0) {
      return []
    }

    // 收集需要查询的用户ID
    const userIds = new Set<string>()
    friendRecords.forEach((record: any) => {
      userIds.add(record.sendUserId)
      userIds.add(record.revUserId)
    })

    // 查询用户信息
    const userIdsArray = Array.from(userIds)
    const conditions = userIdsArray.map(id => eq(users.userId, id))
    const userInfos = await this.db
      .select({
        userId: users.userId,
        nickName: users.nickName,
        avatar: users.avatar,
        abstract: users.abstract,
        email: users.email,
      })
      .from(users)
      .where(or(...conditions))
      .all()

    // 构建用户映射
    const userMap = new Map<string, any>()
    userInfos.forEach((user: any) => {
      userMap.set(user.userId, user)
    })

    // 生成会话ID的辅助函数
    const generateConversationId = (userId1: string, userId2: string): string => {
      const sortedIds = [userId1, userId2].sort()
      return `private_${sortedIds[0]}_${sortedIds[1]}`
    }

    // 构建好友列表
    const friends = friendRecords.map((record: any) => {
      // 确定好友的用户ID
      const friendUserId = record.sendUserId === currentUserId
        ? record.revUserId
        : record.sendUserId

      // 获取好友用户信息
      const friendUser = userMap.get(friendUserId)

      // 确定备注信息
      const notice = record.sendUserId === currentUserId
        ? record.sendUserNotice || ''
        : record.revUserNotice || ''

      return {
        userId: friendUserId,
        nickName: friendUser?.nickName || '',
        avatar: friendUser?.avatar || '',
        abstract: friendUser?.abstract || '',
        notice,
        isFriend: true,
        conversationId: generateConversationId(currentUserId, friendUserId),
        email: friendUser?.email || '',
        source: record.source || '',
      }
    })
    return friends
  }

  /**
   * @description 根据friendshipIds批量查询本地好友关系（仅原始记录映射）
   */
  async getFriendRecordsByIds(req: DBGetFriendRecordsByIdsReq): Promise<DBGetFriendRecordsByIdsRes> {
    const { friendshipIds } = req
    if (friendshipIds.length === 0) {
      return new Map()
    }

    const existingFriends = await this.db
      .select()
      .from(friends)
      .where(inArray(friends.friendId, friendshipIds as any))
      .all()

    const friendRecords = new Map<string, any>()
    existingFriends.forEach((friend: any) => {
      friendRecords.set(friend.friendId, friend)
    })

    return friendRecords
  }

  /**
   * @description 批量创建好友关系（调用upsert方法，避免重复数据错误）
   */
  async batchCreate(req: DBBatchCreateFriendsReq): Promise<void> {
    const { friends } = req
    if (friends.length === 0)
      return

    for (const friend of friends) {
      await this.upsert(friend)
    }
  }

  /**
   * @description 获取好友关系记录（纯数据库查询，不含业务逻辑）
   */
  async getFriendRelations(req: DBGetFriendRelationsReq): Promise<DBGetFriendRelationsRes> {
    const { userId, options } = req
    const { page = 1, limit = 20 } = options || {}
    const offset = (page - 1) * limit

    const relations = await this.db
      .select()
      .from(friends)
      .where(and(
        or(eq(friends.sendUserId, userId as any), eq(friends.revUserId, userId as any)),
        eq(friends.isDeleted, 0 as any),
      ))
      .limit(limit)
      .offset(offset)
      .all()

    return relations
  }

  /**
   * @description 根据版本范围获取好友
   */
  async getFriendsByVerRange(req: DBGetFriendsByVerRangeReq): Promise<DBGetFriendsByVerRangeRes> {
    try {
      const { userId, startVersion = 0, endVersion = Number.MAX_SAFE_INTEGER } = req

      if (!userId) {
        console.error('用户ID不能为空')
        return []
      }

      // 查询指定版本范围内的好友关系记录
      const friendRelations = await this.db
        .select()
        .from(friends)
        .where(and(
          or(eq(friends.sendUserId, userId), eq(friends.revUserId, userId)),
          eq(friends.isDeleted, 0),
          gte(friends.version, startVersion),
          lte(friends.version, endVersion),
        ))
        .all()

      if (friendRelations.length === 0) {
        return []
      }

      // 收集需要查询的用户ID
      const userIds = new Set<string>()
      friendRelations.forEach((relation: any) => {
        if (relation.sendUserId === userId) {
          userIds.add(relation.revUserId)
        }
        else {
          userIds.add(relation.sendUserId)
        }
      })

      // 查询用户信息
      const userIdsArray = Array.from(userIds)
      if (userIdsArray.length > 0) {
        const conditions = userIdsArray.map(id => eq(users.userId, id))
        const userInfos = await this.db
          .select({
            userId: users.userId,
            nickName: users.nickName,
            avatar: users.avatar,
            abstract: users.abstract,
            email: users.email,
          })
          .from(users)
          .where(or(...conditions))
          .all()

        // 构建用户映射
        const userMap = new Map<string, any>()
        userInfos.forEach((user: any) => {
          userMap.set(user.userId, user)
        })

        // 构建好友列表
        const friendList: IFriendInfo[] = friendRelations.map((relation: any) => {
          const friendUserId = relation.sendUserId === userId
            ? relation.revUserId
            : relation.sendUserId

          const friendUser = userMap.get(friendUserId)
          const notice = relation.sendUserId === userId
            ? relation.sendUserNotice
            : relation.revUserNotice

          return {
            userId: friendUserId,
            nickName: friendUser?.nickName || '',
            fileName: friendUser?.avatar || '',
            abstract: friendUser?.abstract || '',
            notice: notice || '',
            isFriend: true,
            conversationId: generateConversationId(userId, friendUserId),
            email: friendUser?.email || '',
            source: relation.source || '',
          }
        })

        return friendList
      }

      return []
    }
    catch (error) {
      console.error('根据版本范围获取好友列表失败:', error)
      return []
    }
  }
}

// 导出好友服务实例
export default new Friend()
