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

import type { QueueItem } from '../base/base'
import { NotificationGroupCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { groupJoinRequestSyncApi } from 'mainModule/api/group'
import dBServiceGroupJoinRequest  from 'mainModule/database/services/group/group-join-request'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 群加入请求同步队列项
 */
interface GroupJoinRequestSyncItem extends QueueItem {
  userId: string
  groupId?: string
  version: number
}

/**
 * 群加入请求业务逻辑
 * 对应 group_join_requests 表
 * 负责群加入请求管理的业务逻辑
 */
class GroupJoinRequestBusiness extends BaseBusiness<GroupJoinRequestSyncItem> {
  protected readonly businessName = 'GroupJoinRequestBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 群加入请求同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 处理群加入请求表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, groupId: string, version: number) {
    this.addToQueue({
      key: `${userId}:${groupId}`,
      data: { userId, groupId, version },
      timestamp: Date.now(),
      userId,
      groupId,
      version,
    })
  }

  /**
   * 批量处理群加入请求同步请求
   */
  protected async processBatchRequests(items: GroupJoinRequestSyncItem[]): Promise<void> {
    // 构造同步请求参数
    const requestsToSync = items.map(item => ({
      groupId: item.groupId || '',
      version: item.version,
    })).filter(item => item.groupId)

    if (requestsToSync.length === 0) {
      console.log('群加入请求同步完成: noValidGroupIds=true')
      return
    }

    try {
      const response = await groupJoinRequestSyncApi({
        groups: requestsToSync, // 复用相同的结构
      })

      if (response.result?.groupJoinRequests && response.result.groupJoinRequests.length > 0) {
        // 更新本地数据库，转换数据类型
        for (const request of response.result.groupJoinRequests) {
          const requestData = {
            id: request.id,
            groupId: request.groupId,
            applicantUserId: request.applicantUserId,
            message: request.message || '',
            status: request.status || 0,
            createdAt: Math.floor(request.createdAt / 1000), // 转换为秒级时间戳
            handledAt: request.handledAt ? Math.floor(request.handledAt / 1000) : null,
            handledBy: request.handledBy,
            version: request.version || 0,
          }
          await dBServiceGroupJoinRequest.upsert(requestData)
        }

        console.log(`群加入请求数据同步成功: count=${response.result.groupJoinRequests.length}`)

        // 发送通知到render进程，告知群加入请求数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_GROUP, NotificationGroupCommand.GROUP_VALID_UPDATE, {
          updatedRequests: response.result.groupJoinRequests.map((request: any) => ({
            id: request.id,
            groupId: request.groupId,
            applicantUserId: request.applicantUserId,
            version: request.version,
          })),
        })
      }
      else {
        console.log('群加入请求数据同步完成: noUpdates=true')
      }
    }
    catch (error) {
      console.error('同步群加入请求数据失败:', error)
    }
  }
}

// 导出单例实例
export default new GroupJoinRequestBusiness()
