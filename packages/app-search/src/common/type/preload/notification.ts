/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 搜索→验证 跨窗口通知枚举（本包所需子集）。
 * 宿主 commonModule/type/preload/notification 同值；按模块边界允许重复。
 */
export enum NotificationModule {
  /** 搜索结果通知到验证窗口 */
  SEARCH_TO_VERIFY = 'search:to:verify',
}

export enum NotificationSearchToVerifyCommand {
  /** 搜索到验证 data: { type, id, title, avatar, source } */
  SEARCH_TO_VERIFY = 'searchToVerify',
}

/** SEARCH_TO_VERIFY 通道的 payload（本包所需子集）。宿主 commonModule/type/preload/notification 同形；按模块边界允许重复。 */
export interface INotificationPayload {
  command: NotificationSearchToVerifyCommand
  data?: {
    type: 'friend' | 'group'
    id: string
    title: string
    avatar: string
    source: string
    conversationId?: string
  }
}
