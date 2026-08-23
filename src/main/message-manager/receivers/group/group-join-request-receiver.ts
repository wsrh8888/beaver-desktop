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

import groupJoinRequestBusiness from 'mainModule/business/group/group-join-request'

/**
 * @description: 群加入请求接收器 - 处理 group_join_requests 表的操作
 */
class GroupJoinRequestReceiver {
  /**
   * 处理群加入请求表更新通知
   * 只处理 group_join_requests 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // group 模块的 tableUpdatesBody 直接就是单个表的更新结构
    // { table: "group_join_requests", data: [{ groupId: "...", applicantUserId: "...", version: 1 }, ...] }

    // 检查是否是 group_join_requests 表的更新
    if (tableUpdatesBody.table !== 'group_join_requests') {
      console.warn('GroupJoinRequestReceiver 收到非 group_join_requests 表的更新', tableUpdatesBody)
      return
    }

    // 处理每条数据记录
    for (const dataItem of tableUpdatesBody.data) {
      if (dataItem?.groupId && dataItem?.version) {
        await groupJoinRequestBusiness.handleTableUpdates(tableUpdatesBody.userId || '', dataItem.groupId, dataItem.version)
      }
    }
  }
}

export default new GroupJoinRequestReceiver()
