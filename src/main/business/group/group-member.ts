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
import { groupMemberSyncApi } from 'mainModule/api/group'
import dBServiceGroupMember  from 'mainModule/database/services/group/group-member'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 群成员同步队列项
 */
interface GroupMemberSyncItem extends QueueItem {
  userId: string
  groupId?: string
  version: number
}

/**
 * 群成员业务逻辑
 * 对应 group_members 表
 * 负责群成员管理的业务逻辑
 */
class GroupMemberBusiness extends BaseBusiness<GroupMemberSyncItem> {
  protected readonly businessName = 'GroupMemberBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 群成员同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 处理群成员表的更新通知
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
   * 批量处理群成员同步请求
   */
  protected async processBatchRequests(items: GroupMemberSyncItem[]): Promise<void> {
    // 构造同步请求参数
    const membersToSync = items.map(item => ({
      groupId: item.groupId || '',
      version: item.version,
    })).filter(item => item.groupId)

    if (membersToSync.length === 0) {
      this.logger.info({ text: '群成员批量同步跳过：无有效群组ID' })
      return
    }

    try {
      const response = await groupMemberSyncApi({
        groups: membersToSync, // 复用相同的结构
      })

      if (response.result?.groupMembers && response.result.groupMembers.length > 0) {
        // 更新本地数据库，转换数据类型
        for (const member of response.result.groupMembers) {
          const memberData = {
            groupId: member.groupId,
            userId: member.userId,
            role: member.role || 3,
            status: member.status || 1,
            joinTime: Math.floor(member.joinTime / 1000), // 转换为秒级时间戳
            version: member.version || 0,
          }
          await dBServiceGroupMember.upsert(memberData)
        }

        this.logger.info({ text: '群成员数据同步成功', data: { count: response.result.groupMembers.length } })

        // 发送通知到render进程，告知群成员数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_GROUP, NotificationGroupCommand.GROUP_MEMBER_UPDATE, {
          updatedMembers: response.result.groupMembers.map((member: any) => ({
            groupId: member.groupId,
            userId: member.userId,
            version: member.version,
          })),
        })
      }
      else {
        this.logger.info({ text: '群成员数据同步完成：无更新数据' })
      }
    }
    catch (error) {
      this.logger.error({ text: '同步群成员数据失败', data: { error: (error as Error)?.message, stack: (error as Error)?.stack } })
    }
  }
}

// 导出单例实例
export default new GroupMemberBusiness()
