import type { IUserInfoRes, IUserSyncItem } from 'commonModule/type/ajax/user'
import type { IDBUser } from 'commonModule/type/database/db/user'
import { sql } from 'drizzle-orm'
import { BaseService } from '../base'
import { users } from '../../tables/user/user'
import type {
  DBCreateUserReq,
  DBUpsertUserReq,
  DBBatchCreateUsersReq,
  DBGetUserByIdReq,
  DBGetUserByIdRes,
  DBGetUserBasicInfoReq,
  DBGetUserBasicInfoRes,
  DBGetUsersBasicInfoReq,
  DBGetUsersBasicInfoRes,
  DBGetAllUsersReq,
  DBGetAllUsersRes,
} from 'commonModule/type/database/server/user/user'

// 用户服务
class User extends BaseService {
  /**
   * @description 创建用户
   */
  async create(req: DBCreateUserReq): Promise<void> {
    await this.db.insert(users).values(req).run()
  }

  /**
   * @description 创建或更新用户（upsert操作）
   */
  async upsert(req: DBUpsertUserReq): Promise<void> {
    await this.db.insert(users)
      .values(req)
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          nickName: req.nickName,
          avatar: req.avatar,
          abstract: req.abstract,
          phone: req.phone,
          email: req.email,
          gender: req.gender,
          status: req.status,
          version: req.version,
          updatedAt: req.updatedAt,
        },
      })
      .run()
  }

  /**
   * @description 批量创建用户（调用upsert方法，避免重复数据错误）
   */
  async batchCreate(req: DBBatchCreateUsersReq): Promise<void> {
    if (req.usersData.length === 0)
      return

    for (const user of req.usersData) {
      await this.upsert(user)
    }
  }

  /**
   * @description 根据用户ID获取用户信息
   */
  async getUserById(req: DBGetUserByIdReq): Promise<DBGetUserByIdRes> {
    try {
      const userId = req.header.userId as string
      const userData = await this.db
        .select({
          userId: users.userId,
          nickName: users.nickName,
          avatar: users.avatar,
          abstract: users.abstract,
          phone: users.phone,
          email: users.email,
          gender: users.gender,
          version: users.version,
        })
        .from(users)
        .where(sql`${users.userId} = ${userId}`)
        .limit(1)

      if (userData.length === 0) {
        return { userInfo: null }
      }

      const user = userData[0]
      return {
        userInfo: {
          userId: user.userId,
          nickName: user.nickName,
          avatar: user.avatar || '',
          abstract: user.abstract || '',
          phone: user.phone,
          email: user.email,
          gender: user.gender || 0,
        }
      }
    }
    catch (error) {
      console.error('根据ID获取用户信息失败:', error)
      return { userInfo: null }
    }
  }

  /**
   * @description 根据用户ID获取用户基本信息（包括版本号）
   */
  async getUserBasicInfo(req: DBGetUserBasicInfoReq): Promise<DBGetUserBasicInfoRes> {
    try {
      const userData = await this.db
        .select({
          userId: users.userId,
          version: users.version,
        })
        .from(users)
        .where(sql`${users.userId} = ${req.userId}`)
        .limit(1)

      if (userData.length === 0) {
        return { userInfo: null }
      }

      return { userInfo: userData[0] }
    }
    catch (error) {
      console.error('获取用户基本信息失败:', error)
      return { userInfo: null }
    }
  }

  /**
   * @description 批量获取用户基本信息（用于消息发送者信息）
   */
  async getUsersBasicInfo(req: DBGetUsersBasicInfoReq): Promise<DBGetUsersBasicInfoRes> {
    if (req.userIds.length === 0) {
      return []
    }

    try {
      const userData = await this.db
        .select({
          userId: users.userId,
          nickName: users.nickName,
          avatar: users.avatar,
        })
        .from(users)
        .where(sql`${users.userId} IN (${sql.join(req.userIds.map(id => sql`${id}`), sql`, `)})`)

      return userData.map((user: any) => ({
        userId: user.userId,
        nickName: user.nickName,
        avatar: user.avatar || '',
      }))
    }
    catch (error) {
      console.error('批量获取用户基本信息失败:', error)
      return []
    }
  }

  /**
   * @description 获取所有用户基本信息（用于contactStore初始化）
   */
  async getAllUsers(req: DBGetAllUsersReq): Promise<DBGetAllUsersRes> {
    try {
      const userData = await this.db
        .select({
          userId: users.userId,
          nickName: users.nickName,
          avatar: users.avatar,
          abstract: users.abstract,
          phone: users.phone,
          email: users.email,
          gender: users.gender,
          status: users.status,
          version: users.version,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)

      return userData.map((user: any) => ({
        userId: user.userId,
        nickName: user.nickName,
        avatar: user.avatar || '',
        abstract: user.abstract || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 0,
        status: user.status || 0,
        version: user.version || 0,
        createdAt: user.createdAt || 0,
        updatedAt: user.updatedAt || 0,
      }))
    }
    catch (error) {
      console.error('获取所有用户失败:', error)
      return []
    }
  }
}

// 导出用户服务实例
export default new User()
