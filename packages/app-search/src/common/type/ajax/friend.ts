/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 好友 ajax 类型（本包所需子集）。
 * 宿主 commonModule/type/ajax/friend 同值；按模块边界允许重复。
 */

export interface ISearchUser {
  /** 搜索关键词（用户ID或邮箱） */
  keyword: string
  /** 搜索类型：id(用户ID)/email(邮箱)，默认email */
  type?: string
}

export interface IAddFriendReq {
  friendId: string
  verify?: string
  /** 添加好友来源：email(邮箱搜索)/qrcode(扫码) */
  source?: string
}

export interface IAddFriendRes {}

export interface IResSearchUserInfo {
  userId: string
  nickName: string
  avatar: string
  abstract: string
  notice: string
  isFriend: boolean
  conversationId: string
  email: string
}
