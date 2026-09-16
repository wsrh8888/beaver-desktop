/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 用户设置 - 隐私 */
export interface IUserSettingsPrivacy {
  allowFriendRequest: boolean
  showOnlineStatus: boolean
  allowSearchByPhone: boolean
  allowSearchByEmail: boolean
}

/** 用户设置 - 通知策略 */
export interface IUserSettingsNotification {
  notifyFriendRequest: boolean
  notifyGroupMessage: boolean
  notifyMoment: boolean
}

/** 用户设置 - 快捷键 */
export interface IUserSettingsKeyboard {
  screenshot: string
  toggleWindow: string
  sendMessage: string
}

/** 获取用户设置响应 */
export interface IUserSettingsRes {
  privacy: IUserSettingsPrivacy
  notification: IUserSettingsNotification
  keyboard: IUserSettingsKeyboard
}

/** 更新用户设置请求（局部更新） */
export interface IUpdateUserSettingsReq {
  privacy?: Partial<IUserSettingsPrivacy>
  notification?: Partial<IUserSettingsNotification>
  keyboard?: Partial<IUserSettingsKeyboard>
}

export interface IUpdateUserSettingsRes {}
