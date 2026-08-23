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

export interface IParticipant {
  userId: string
  status: 'calling' | 'joined' | 'left' | 'rejected' | 'busy'
}

// 发起音视频通话请求
export interface IStartCallReq {
  callType: number // 通话类型：1-私聊, 2-群聊
  callMode: number // 1-语音, 2-视频
  conversationId: string // 会话ID：带前缀的完整格式
}

// 发起音视频通话响应
export interface IStartCallRes {
  roomId: string // 房间ID
  roomToken: string // LiveKit令牌
  liveKitUrl: string // LiveKit服务器地址
  participants: IParticipant[] // 初始参与者快照
}

// 获取通话令牌请求
export interface IGetCallTokenReq {
  roomId: string
}

// 获取通话令牌响应
export interface IGetCallTokenRes {
  roomToken: string
  liveKitUrl: string
  participants: IParticipant[] // 当前所有成员快照
}

// 挂断/拒绝通话请求
export interface IHangupCallReq {
  roomId: string
}

// 挂断/拒绝通话响应
export interface IHangupCallRes { }

// 新增成员请求
export interface IAddCallMemberReq {
  roomId: string
}

// 新增成员响应
export interface IAddCallMemberRes {
  roomToken: string
  liveKitUrl: string
}

// 获取房间成员清单请求
export interface IGetCallParticipantsReq {
  roomId: string
}

// 获取房间成员清单响应
export interface IGetCallParticipantsRes {
  participants: IParticipant[]
}

export interface IInviteCallMemberReq {
  roomId: string;
  targetIds: string[];
}

export interface IInviteCallMemberRes { }

// 通话历史记录请求
export interface IGetCallHistoryReq {
  page?: number
  size?: number
}

// 通话历史记录项
export interface ICallHistoryItem {
  roomId: string
  callerId: string
  callType: number
  status: number
  startTime: number
  duration: number
}

// 通话历史记录响应
export interface IGetCallHistoryRes {
  list: ICallHistoryItem[]
}
