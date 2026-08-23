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

// 使用统一的初始化入口
export { initTables } from '../init'

export { chatConversations } from './chat/conversation'
// 聊天相关表
export { chatMessageMedias } from './chat/message-media'
export { chats } from './chat/message'
export { chatSyncStatus } from './chat/sync-status'
export { chatUserConversations } from './chat/user-conversation'

export { emojiCollect } from './emoji/collect'
// 表情相关表
export { emoji } from './emoji/emoji'

export { emojiPackage } from './emoji/package'
export { emojiPackageCollect } from './emoji/package_collect'
export { emojiPackageEmoji } from './emoji/package_emoji'
// 好友相关表
export { friends } from './friend/friend'

export { friendVerifies } from './friend/friend_verify'

// 群组相关表
export { groups } from './group/groups'

export { groupJoinRequests } from './group/join-requests'
export { groupMembers } from './group/members'
export { groupSyncStatus } from './group/sync-status'
export { circles } from './circle/circles'
// 媒体表
export { media } from './media/media'
// 通知相关表
export { notificationEvents } from './notification/event'
export { notificationInboxes } from './notification/inbox'
export { notificationReads } from './notification/read'
// 用户相关表
export * from './user/user'
