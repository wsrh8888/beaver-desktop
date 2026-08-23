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

import chatSvg from 'renderModule/assets/image/leftBar/chat.svg'
import chatActive from 'renderModule/assets/image/leftBar/chat_active.svg'
import friendSvg from 'renderModule/assets/image/leftBar/friend.svg'
import friendActive from 'renderModule/assets/image/leftBar/friend_active.svg'
import momentSvg from 'renderModule/assets/image/leftBar/moment.svg'
import momentActive from 'renderModule/assets/image/leftBar/moment_active.svg'
import circleSvg from 'renderModule/assets/image/leftBar/circle.svg'
import circleActive from 'renderModule/assets/image/leftBar/circle_active.svg'
import workbenchSvg from 'renderModule/assets/image/leftBar/workbench.svg'
import workbenchActive from 'renderModule/assets/image/leftBar/workbench_active.svg'
import assistantSvg from 'renderModule/assets/image/leftBar/assistant.svg'
import assistantActive from 'renderModule/assets/image/leftBar/assistant_active.svg'
import logoutIcon from 'renderModule/assets/image/leftBar/settings/logout.svg'
import profileIcon from 'renderModule/assets/image/leftBar/settings/profile.svg'
import settingsIcon from 'renderModule/assets/image/leftBar/settings/settings.svg'
import aboutIcon from 'renderModule/assets/image/leftBar/settings/about.svg'

export interface ISidebarNavItem {
  id: string
  title: string
  defaultIcon: string
  activeIcon: string
  router?: string
  badgeCategories?: string[]
  badgeCategory?: string
}

/** IM 核心：聊天、好友 */
export const coreNavList: ISidebarNavItem[] = [
  {
    id: 'message',
    title: '聊天',
    defaultIcon: chatSvg,
    activeIcon: chatActive,
    router: '/message',
  },
  {
    id: 'friend',
    title: '好友',
    router: '/friend',
    defaultIcon: friendSvg,
    activeIcon: friendActive,
    badgeCategories: ['social', 'group'],
  },
]

/** 应用扩展：独立窗口能力 */
export const appNavList: ISidebarNavItem[] = [
  {
    id: 'ai',
    title: 'AI助手',
    defaultIcon: assistantSvg,
    activeIcon: assistantActive,
  },
  {
    id: 'circle',
    title: '圈子',
    defaultIcon: circleSvg,
    activeIcon: circleActive,
  },
  {
    id: 'workbench',
    title: '工作台',
    defaultIcon: workbenchSvg,
    activeIcon: workbenchActive,
  },
  {
    id: 'moment',
    title: '朋友圈',
    defaultIcon: momentSvg,
    activeIcon: momentActive,
    badgeCategories: ['moment'],
  },
]

export const userInfoMenuList = [
  {
    key: 'profile',
    label: '个人资料',
    icon: profileIcon,
  },
  {
    key: 'settings',
    label: '设置',
    icon: settingsIcon,
  },
  {
    key: 'about',
    label: '开源致谢',
    icon: aboutIcon,
  },
  {
    key: 'logout',
    label: '退出',
    icon: logoutIcon,
  },
]
