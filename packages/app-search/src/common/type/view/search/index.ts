/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 搜索结果项：search 窗口点击「添加」后，经 SEARCH_TO_VERIFY 通知传给 verify 窗口。
 * 宿主 commonModule/type/view/search 同值；按模块边界允许重复。
 */
export interface ISearchResult {
  /** 用户/群组 ID */
  id: string
  /** 会话ID */
  conversationId: string
  /** 标题 */
  title: string
  /** 头像 */
  avatar: string
  /** 类型 */
  type: 'friend' | 'group'
  /** 来源 */
  source: string
}
