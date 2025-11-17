import { and, eq, gte, inArray, lte, or } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { friends } from 'mainModule/database/tables/friend/friend'
import { users } from 'mainModule/database/tables/user/user'

// 好友服务
export class FriendService {
  static get db() {
    return dbManager.db
  }

  // 创建好友关系
  static async create(friendData: any) {
    return await this.db.insert(friends).values(friendData).run()
  }

  // 创建或更新好友关系（upsert操作）
  static async upsert(friendData: any) {
    return await this.db.insert(friends)
      .values(friendData)
      .onConflictDoUpdate({
        target: friends.uuid,
        set: {
          sendUserId: friendData.sendUserId,
          revUserId: friendData.revUserId,
          sendUserNotice: friendData.sendUserNotice,
          revUserNotice: friendData.revUserNotice,
          source: friendData.source,
          isDeleted: friendData.isDeleted,
          version: friendData.version,
          updatedAt: friendData.updatedAt,
        },
      })
      .run()
  }

  // 批量获取好友详细信息（包含用户信息和备注）
  static async getFriendDetails(userId: string, friendIds: string[]): Promise<Map<string, any>> {
    if (friendIds.length === 0) {
      return new Map()
    }

    // 查询当前用户与指定好友的好友关系
    const friendRelations = await dbManager.db
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
    const userInfos = await dbManager.db
      .select({
        uuid: users.uuid,
        nickName: users.nickName,
        avatar: users.avatar,
        abstract: users.abstract,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.uuid, userIdsArray))
      .all()

    // 构建用户信息的映射
    const userInfoMap = new Map<string, any>()
    userInfos.forEach((user: any) => {
      userInfoMap.set(user.uuid, user)
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
          userId: userInfo.uuid,
          nickname: userInfo.nickName || '',
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

  // 根据用户ID列表批量查询好友信息
  static async getFriendsByUserIds(userIds: string[]): Promise<IFriendInfo[]> {
    if (userIds.length === 0) {
      return []
    }

    const friends = await this.db
      .select()
      .from(friendsTable)
      .where(inArray(friendsTable.userId, userIds as any))
      .all()

    return friends.map((friend: any) => ({
      userId: friend.userId,
      nickname: friend.nickname,
      avatar: friend.avatar,
      conversationId: friend.conversationId,
      version: friend.version,
    }))
  }

  // 根据friendshipIds批量查询本地好友关系
  static async getFriendsByIds(friendshipIds: string[]): Promise<Map<string, any>> {
    if (friendshipIds.length === 0) {
      return new Map()
    }

    const existingFriends = await this.db
      .select()
      .from(friends)
      .where(inArray(friends.uuid, friendshipIds as any))
      .all()

    const friendMap = new Map<string, any>()
    existingFriends.forEach((friend: any) => {
      friendMap.set(friend.uuid, friend)
    })

    return friendMap
  }

  // 批量创建好友关系（调用upsert方法，避免重复数据错误）
  static async batchCreate(friendsData: any[]) {
    if (friendsData.length === 0)
      return

    for (const friend of friendsData) {
      await this.upsert(friend)
    }
  }

  /**
   * 获取好友关系记录（纯数据库查询，不含业务逻辑）
   */
  static async getFriendRelations(userId: string, options?: { page?: number, limit?: number }): Promise<any[]> {
    const { page = 1, limit = 20 } = options || {}
    const offset = (page - 1) * limit

    return await this.db
      .select()
      .from(friends)
      .where(and(
        or(eq(friends.sendUserId, userId as any), eq(friends.revUserId, userId as any)),
        eq(friends.isDeleted, 0 as any),
      ))
      .limit(limit)
      .offset(offset)
      .all()
  }

  static async getFriendsByVerRange(header: any, params: any): Promise<{ list: IFriendInfo[] }> {
    try {
      const userId = header?.userId

      if (!userId) {
        console.error('用户ID不能为空')
        return { list: [] }
      }

      const startVersion = params?.startVersion || 0
      const endVersion = params?.endVersion || Number.MAX_SAFE_INTEGER

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
        return { list: [] }
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
        const conditions = userIdsArray.map(id => eq(users.uuid, id))
        const userInfos = await this.db
          .select({
            uuid: users.uuid,
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
          userMap.set(user.uuid, user)
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
            nickname: friendUser?.nickName || '',
            fileName: friendUser?.avatar || '',
            abstract: friendUser?.abstract || '',
            notice: notice || '',
            isFriend: true,
            conversationId: generateConversationId(userId, friendUserId),
            email: friendUser?.email || '',
            source: relation.source || '',
          }
        })

        return { list: friendList }
      }

      return { list: [] }
    }
    catch (error) {
      console.error('根据版本范围获取好友列表失败:', error)
      return { list: [] }
    }
  }
}
