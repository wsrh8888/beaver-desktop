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

export interface ITextMsg {
  content: string
}

export interface IImageMsg {
  fileUrl: string
  width?: number
  height?: number
  size?: number
}

export interface IVideoMsg {
  fileUrl: string
  width?: number
  height?: number
  duration?: number
  thumbnailUrl?: string
  size?: number
}

export interface IFileMsg {
  fileUrl: string
  fileName?: string
  size?: number
  mimeType?: string
}

export interface IEmojiMsg {
  fileUrl: string
  emojiId: string
  packageId: string
  width?: number
  height?: number
}

export interface IAudioFileMsg {
  fileUrl: string
  fileName?: string
  duration?: number
  size?: number
}

export interface IReplyMsg {
  originMsgId: string
  originMsg?: IMessageMsg | null
  replyMsg: IMessageMsg
}

export interface IVoiceMsg {
  fileUrl: string
  duration?: number
  size?: number
}

export interface IMarkdownMsg {
  content: string
  title?: string
}

export interface ICardMsg {
  cardType: number // 1=个人 2=群 3=圈子
  id: string
  expireAt?: number // 秒，0=不过期
  inviteToken?: string // 分享邀请凭证
}

export interface IMessageMsg {
  type: number
  targetMsgId?: string
  textMsg?: ITextMsg | null
  imageMsg?: IImageMsg | null
  videoMsg?: IVideoMsg | null
  fileMsg?: IFileMsg | null
  voiceMsg?: IVoiceMsg | null
  emojiMsg?: IEmojiMsg | null
  audioFileMsg?: IAudioFileMsg | null
  replyMsg?: IReplyMsg | null
  notificationMsg?: { type: number, actors: string[] } | null
  withdrawMsg?: { originMsgId: string, originMsg?: any } | null
  forwardMsg?: {
    title: string
    recordId: string
    count: number
    msgList?: IMessageMsg[]
  } | null
  markdownMsg?: IMarkdownMsg | null
  cardMsg?: ICardMsg | null
}

export interface IMessageSender {
  avatar?: string
  nickName?: string
  userId: string
}

export interface IPrivateMessageReceiveBody {
  conversationId: string
  conversationType: number
  createdAt: string
  id?: number
  messageId: string
  msg: IMessageMsg
  msgPreview: string
  sender: IMessageSender
  seq: number
  status?: number
}

export interface IPrivateMessageSyncBody extends IPrivateMessageReceiveBody {}

export interface IChatMessageSendBody {
  conversationId: string
  messageId: string
  msg: IMessageMsg
  chatType: 'private' | 'group'
}

/** @deprecated Use IChatMessageSendBody instead */
export type IPrivateMessageSendBody = IChatMessageSendBody

export interface ITableUpdate {
  table: 'messages' | 'conversations' | 'user_conversations'
  conversationId?: string
  userId?: string
  data: Array<{
    seq?: number
    version?: number
  }>
}

export interface ITableUpdatesBody {
  tableUpdates: ITableUpdate[]
}
