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

import groupSync from './group'
import groupJoinRequestSync from './group-join-request'
import groupMemberSync from './group-member'

// 群组数据同步统一入口
// 独立同步三个模块：群资料、群成员、入群申请
export const groupDatasync = new class GroupDatasync {
  async checkAndSync() {
    // 并行执行所有群组相关同步器
    await Promise.all([
      groupSync.checkAndSync(), // 群资料同步
      groupMemberSync.checkAndSync(), // 群成员同步
      groupJoinRequestSync.checkAndSync(), // 入群申请同步
    ])
  }
}()
