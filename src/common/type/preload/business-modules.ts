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

/**
 * @description: 用户模块接口
 */
export interface IUserModule {
  getUserInfo(): Promise<any>
  onInfoUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 好友模块接口
 */
export interface IFriendModule {
  getFriends(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 群组模块接口
 */
export interface IGroupModule {
  getGroups(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 会话模块接口
 */
export interface IConversationModule {
  getConversations(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 消息模块接口
 */
export interface IMessageModule {
  getChatMessages(conversationId: string, pagination?: any): Promise<any>
  sendMessage(conversationId: string, content: string, messageType: number): Promise<boolean>
  onNewMessage(callback: (data: any) => void): void
  removeNewMessageListener(callback: (data: any) => void): void
  onStatusUpdated(callback: (data: any) => void): void
  removeStatusListener(callback: (data: any) => void): void
}

/**
 * @description: 数据同步模块接口
 */
export interface ISyncModule {
  onStatusUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}
