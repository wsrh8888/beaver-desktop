import type { QueueItem } from '../base/base'
import { NotificationModule, NotificationUserCommand } from 'commonModule/type/preload/notification'
import { userSyncApi } from 'mainModule/api/user'
import { UserService } from 'mainModule/database/services/user/user'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 用户同步队列项
 */
interface UserSyncItem extends QueueItem {
  userId: string
  version: number
}

/**
 * 用户业务逻辑
 * 对应 users 表
 * 负责用户管理的业务逻辑
 */
export class UserBusiness extends BaseBusiness<UserSyncItem> {
  protected readonly businessName = 'UserBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 用户同步请求较少
      delayMs: 1000,
    })
  }

  /**
   * 处理用户表更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, version: number) {
    this.addToQueue({
      key: userId,
      data: { userId, version },
      timestamp: Date.now(),
      userId,
      version,
    })
  }

  /**
   * 批量处理用户同步请求
   */
  protected async processBatchRequests(items: UserSyncItem[]): Promise<void> {
    // 构造同步请求参数
    const userVersions = items.map(item => ({
      userId: item.userId,
      version: item.version,
    }))

    if (userVersions.length === 0) {
      console.log('用户同步完成: noValidUserIds=true')
      return
    }

    try {
      const response = await userSyncApi({
        userVersions,
      })

      if (response.result?.users && response.result.users.length > 0) {
        // 更新本地数据库，转换数据类型
        for (const user of response.result.users) {
          const userData = {
            uuid: user.userId,
            nickName: user.nickname,
            avatar: user.avatar,
            abstract: user.abstract,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            status: user.status,
            version: user.version,
            createdAt: Math.floor(user.createAt / 1000), // 转换为秒级时间戳
            updatedAt: Math.floor(user.updateAt / 1000),
          }
          await UserService.upsert(userData)
        }

        console.log(`用户数据同步成功: count=${response.result.users.length}`)

        // 发送通知到render进程，告知用户数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_USER, NotificationUserCommand.USER_UPDATE, {
          updatedUsers: response.result.users.map((user: any) => ({
            userId: user.userId,
            version: user.version,
          })),
        })
      }
      else {
        console.log('用户数据同步完成: noUpdates=true')
      }
    }
    catch (error) {
      console.error('同步用户数据失败:', error)
    }
  }
}

// 导出单例实例
export const userBusiness = new UserBusiness()
