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
      return []
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

    return friendRelations
  }

  /**
   * @description 根据好友关系ID列表批量查询好友关系记录
   */
  async getFriendsByIds(req: DBGetFriendsByIdsReq): Promise<DBGetFriendsByIdsRes> {
    const { friendIds } = req
    if (friendIds.length === 0) {
      return []
    }

    const friendRecords = await this.db
      .select()
      .from(friends)
      .where(inArray(friends.friendId, friendIds as any))
      .all()

    return friendRecords
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
   * @description 根据版本范围获取好友关系记录（纯数据库查询）
   */
  async getFriendRelationsByVerRange(req: DBGetFriendsByVerRangeReq): Promise<DBGetFriendsByVerRangeRes> {
    const { userId, startVersion = 0, endVersion = Number.MAX_SAFE_INTEGER } = req

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

    return friendRelations
  }
}

// 导出好友服务实例
export default new Friend()
