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

import { initChatTables } from './chat/index'
import { initCircleTables } from './circle/index'
import { initDatasyncTables } from './datasync/index'
import { initEmojiTables } from './emoji/index'
import { initFriendTables } from './friend/index'
import { initGroupTables } from './group/index'
import { initMediaTables } from './media/index'
import { initNotificationTables } from './notification/index'
import { initUserTables } from './user/index'

export const initTables = (db: any) => {
  console.log('开始初始化用户表')
  initUserTables(db)
  initFriendTables(db)
  initGroupTables(db)
  initCircleTables(db)
  initChatTables(db)
  initEmojiTables(db)
  initDatasyncTables(db)
  initNotificationTables(db)
  initMediaTables(db)
  console.log('数据表初始化完成')
}
