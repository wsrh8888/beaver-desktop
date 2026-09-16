/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** beaver-biz 组件用的轻量领域形状（避免依赖宿主 commonModule） */

export const MessageType = {
  TEXT: 1,
  CARD: 16,
} as const

export const CardType = {
  USER: 1,
  GROUP: 2,
  CIRCLE: 3,
} as const

export interface IFriendPickItem {
  userId: string
  nickName: string
  avatar: string
}

export interface IConversationPickItem {
  conversationId: string
  nickName: string
  avatar: string
  chatType?: number
}

/** 分享/转发时投递的消息体（与宿主 IMessageMsg 结构对齐的子集） */
export interface IShareMessagePayload {
  type: number
  textMsg?: { content: string }
  cardMsg?: {
    cardType: number
    id: string
    inviteToken?: string
  }
  [key: string]: unknown
}
