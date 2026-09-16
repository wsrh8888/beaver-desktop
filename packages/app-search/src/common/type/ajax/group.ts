/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 群组 ajax 类型（本包所需子集）。
 * 宿主 commonModule/type/ajax/group 同值；按模块边界允许重复。
 */

export interface ISearchGroupReq {
  keyword: string
  page?: number
  limit?: number
}

export interface IGroupSearchItem {
  /** 群组ID */
  groupId: string
  /** 群组名称 */
  title: string
  /** 群组头像URL */
  avatar: string
  /** 加入方式：0自由加入 1需审批 2不允许加入 */
  joinType: number
  /** 创建者ID */
  creatorId: string
}

export interface IGroupSearchRes {
  list: IGroupSearchItem[]
  count: number
}

export interface IGroupJoinReq {
  /** 目标群组ID（有 inviteCode 时可空） */
  groupId?: string
  /** 申请消息，可选 */
  message?: string
  /** 邀请短码 */
  inviteCode?: string
}

export interface IGroupJoinRes {
  version: number
  status: number
  groupId?: string
}
