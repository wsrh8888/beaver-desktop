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

import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationGroupCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入群组模块的通知处理器
import groupNotificationManager from './group'
import groupJoinRequestNotificationManager from './group-join-request'
import groupMemberNotificationManager from './group-member'

const logger = new Logger('群组模块通知路由器')

/**
 * @description: 群组模块通知路由器
 */
class GroupNotificationRouter {
  /**
   * 处理群组模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_GROUP>) {
    logger.info({
      text: '收到群组模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationGroupCommand.GROUP_UPDATE:
        await groupNotificationManager.processGroupUpdate(params.data)
        break
      case NotificationGroupCommand.GROUP_MEMBER_UPDATE:
        await groupMemberNotificationManager.processGroupMemberUpdate(params.data)
        break
      case NotificationGroupCommand.GROUP_VALID_UPDATE:
        await groupJoinRequestNotificationManager.processGroupJoinRequestUpdate(params.data)
        break
      default:
        logger.warn({ text: '未知的群组通知命令', data: { command: params.command } })
    }
  }
}

export const groupNotificationRouter = new GroupNotificationRouter()
