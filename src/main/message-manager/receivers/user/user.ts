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

import userBusiness from 'mainModule/business/user/user'

/**
 * @description: 用户资料接收器 - 处理 users 表的操作
 */
class UserReceiver {
  /**
   * 处理用户表更新通知
   * 只处理 users 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // user 模块的 tableUpdatesBody 直接就是单个表的更新结构

    // 检查是否是 users 表的更新
    if (tableUpdatesBody.table !== 'users') {
      console.warn('UserReceiver 收到非 users 表的更新', tableUpdatesBody)
      return
    }

    // 处理用户资料更新
    if (tableUpdatesBody?.version && tableUpdatesBody?.targetId) {
      await userBusiness.handleTableUpdates(tableUpdatesBody.targetId, tableUpdatesBody.version)
    }
  }
}

export default new UserReceiver()
