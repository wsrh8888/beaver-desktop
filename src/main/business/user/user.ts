/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { IDBUser } from 'commonModule/type/database/db/user'
import type { QueueItem } from '../base/base'
import { NotificationModule, NotificationUserCommand } from 'commonModule/type/preload/notification'
import { userSyncApi } from 'mainModule/api/user'
import dBServiceUser  from 'mainModule/database/services/user/user'

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
class UserBusiness extends BaseBusiness<UserSyncItem> {
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
          const userData: IDBUser = {
            userId: user.userId,
            nickName: user.nickName,
            avatar: user.avatar,
            abstract: user.abstract,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            status: user.status,
            userType: user.userType,
            version: user.version,
            createdAt: Math.floor(user.createdAt / 1000), // 转换为秒级时间戳
            updatedAt: Math.floor(user.updatedAt / 1000),
          }
          await dBServiceUser.upsert(userData)
        }

        console.log(`用户数据同步成功: count=${response.result.users.length}`)

        // 发送通知到render进程，告知用户数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_USER, NotificationUserCommand.USER_UPDATE, {
          source: 'business', // 标识来源：实时业务同步
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
export default new UserBusiness()
