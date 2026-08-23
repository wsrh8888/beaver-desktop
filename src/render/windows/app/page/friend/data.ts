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

// 好友页面数据配置
import addFriendIcon from 'renderModule/assets/image/friend/user-plus.svg'
import createGroupIcon from 'renderModule/assets/image/friend/users.svg'

// 选项卡配置
export const TABS_CONFIG = [
  { key: 'friends', name: '好友' },
  { key: 'groups', name: '群聊' },
]

// 弹窗菜单配置
export const POPUP_MENU_CONFIG = [
  {
    key: 'add-friend',
    text: '加好友/群',
    icon: addFriendIcon,
    action: 'add-friend',
  },
  {
    key: 'create-group',
    text: '创建群聊',
    icon: createGroupIcon,
    action: 'create-group',
  },
]

export const notificationList = [{
  key: 'friend-notification',
  text: '好友通知',
  badgeCategories: ['social'],
}, {
  key: 'group-notification',
  text: '群通知',
  badgeCategories: ['group'],
}]
