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

import muteIcon from 'renderModule/assets/image/call/mute.svg'
import muteActiveIcon from 'renderModule/assets/image/call/mute_on.svg'
import cameraOffIcon from 'renderModule/assets/image/call/video_off.svg'
import cameraOnIcon from 'renderModule/assets/image/call/video.svg'
import addMemberIcon from 'renderModule/assets/image/call/add_member.svg'

export interface FooterActionItem {
  id: string
  defaultLabel: string
  activeLabel?: string
  defaultIcon: any
  activeIcon?: any
  /** both: 私聊和群聊都显示，group: 仅群聊 */
  visibility: 'both' | 'group'
}

export const FOOTER_ACTION_LIST: FooterActionItem[] = [
  { id: 'mute', defaultLabel: '静音', activeLabel: '取消静音', defaultIcon: muteIcon, activeIcon: muteActiveIcon, visibility: 'both' },
  { id: 'camera', defaultLabel: '开启视频', activeLabel: '关闭视频', defaultIcon: cameraOffIcon, activeIcon: cameraOnIcon, visibility: 'both' },
  { id: 'invite', defaultLabel: '邀请', defaultIcon: addMemberIcon, visibility: 'group' },
  { id: 'manageMembers', defaultLabel: '管理成员', defaultIcon: addMemberIcon, visibility: 'group' },
]
