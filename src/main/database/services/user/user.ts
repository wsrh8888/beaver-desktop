import type { IUserInfoRes, IUserSyncItem } from 'commonModule/type/ajax/user'
import type { IDBUser } from 'commonModule/type/database/user'
import { sql } from 'drizzle-orm'
import dbManager from '../../db'
import { users } from '../../tables/user/user'

// 用户服务
export class UserService {
  static get db() {
    return dbManager.db
  }

  // 创建用户
  static async create(userData: IDBUser) {
    return await this.db.insert(users).values(userData).run()
  }

  // 创建或更新用户（upsert操作）
  static async upsert(userData: IDBUser) {
    return await this.db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          nickName: userData.nickName,
          avatar: userData.avatar,
          abstract: userData.abstract,
          phone: userData.phone,
          email: userData.email,
          gender: userData.gender,
          status: userData.status,
          version: userData.version,
          updatedAt: userData.updatedAt,
        },
      })
      .run()
  }

  // 批量创建用户（调用upsert方法，避免重复数据错误）
  static async batchCreate(usersData: IDBUser[]) {
    if (usersData.length === 0)
      return

    for (const user of usersData) {
      await this.upsert(user)
    }
  }

  // 根据用户ID获取用户信息
  static async getUserById(header: any, _data: any): Promise<IUserInfoRes | null> {
    try {
      const userId = header.userId as string
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
        return null
      }

      const user = userData[0]
      return {
        userId: user.userId,
        nickName: user.nickName,
        avatar: user.avatar || '',
        abstract: user.abstract || '',
        phone: user.phone,
        email: user.email,
        gender: user.gender || 0,
      }
    }
    catch (error) {
      console.error('根据ID获取用户信息失败:', error)
      return null
    }
  }

  // 根据用户ID获取用户基本信息（包括版本号）
  static async getUserBasicInfo(userId: string): Promise<{ userId: string, version: number } | null> {
    try {
      const userData = await this.db
        .select({
          userId: users.userId,
          version: users.version,
        })
        .from(users)
        .where(sql`${users.userId} = ${userId}`)
        .limit(1)

      if (userData.length === 0) {
        return null
      }

      return userData[0]
    }
    catch (error) {
      console.error('获取用户基本信息失败:', error)
      return null
    }
  }

  // 批量获取用户基本信息（用于消息发送者信息）
  static async getUsersBasicInfo(userIds: string[]): Promise<Array<{ userId: string, nickName: string, avatar: string }>> {
    if (userIds.length === 0) {
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
        .where(sql`${users.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)

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

  // 获取所有用户基本信息（用于contactStore初始化）
  static async getAllUsers(): Promise<IUserSyncItem[]> {
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
          createAt: users.createdAt,
          updateAt: users.updatedAt,
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
        createAt: user.createAt || 0,
        updateAt: user.updateAt || 0,
      }))
    }
    catch (error) {
      console.error('获取所有用户失败:', error)
      return []
    }
  }
}
