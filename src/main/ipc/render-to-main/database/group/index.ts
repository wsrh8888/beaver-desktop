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

import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataGroupCommand } from 'commonModule/type/ipc/database'
import groupBusiness from 'mainModule/business/group/group'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const loggerName = 'group-handler'
const logger = new Logger(loggerName)

class GroupHandler {
  /**
   * 处理群组相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataGroupCommand, data: any, header: ICommonHeader): Promise<any> {
    logger.info({ text: '处理群组命令', data: { command, data } })
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      logger.warn({ text: '未获取到用户ID，群组命令终止' })
      throw new Error('用户未登录')
    }

    switch (command) {
      case DataGroupCommand.GET_GROUP_LIST:
        return await groupBusiness.getGroupList(header, data)
      case DataGroupCommand.GET_GROUPS_BATCH:
        return await groupBusiness.getGroupsBatch(header, data)
      case DataGroupCommand.GET_GROUP_MEMBERS:
        return await groupBusiness.getGroupMembers(header, data)
      case DataGroupCommand.GET_GROUP_MEMBERS_BATCH:
        return await groupBusiness.getGroupMembersBatch(header, data)
      case DataGroupCommand.GET_GROUP_JOIN_REQUEST_LIST:
        // 合并为同一个方法：获取用户相关的群组申请（包括用户申请的 + 别人申请用户管理的群组）
        return await groupBusiness.getGroupJoinRequests(header, data)
      default:
        throw new Error('群组数据库命令处理失败GroupHandler')
    }
  }
}

export default new GroupHandler()
