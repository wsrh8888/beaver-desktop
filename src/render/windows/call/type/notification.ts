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

/** 成员状态（与 pinia call CallMember.status 一致） */
export type CallMemberStatus = 'calling' | 'joined' | 'left' | 'rejected' | 'busy'

/** 成员状态对应的展示文案（画面上方占位/提示用） */
export const MEMBER_STATUS_HINT: Record<CallMemberStatus, string> = {
  calling: '等待接听...',
  joined: '',
  left: '已离开',
  rejected: '已拒绝',
  busy: '忙碌中',
}

export function getMemberStatusHint(status: CallMemberStatus): string {
  return MEMBER_STATUS_HINT[status] ?? ''
}
