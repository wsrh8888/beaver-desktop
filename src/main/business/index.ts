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

// Business层统一入口

// Chat模块
export { default as conversationBusiness } from './chat/conversation'
export { default as messageBusiness } from './chat/message'
export { default as userConversationBusiness } from './chat/user-conversation'

// Friend模块
export { default as friendBusiness } from './friend/friend'
export { default as friendVerifyBusiness } from './friend/friend-verify'

// Group模块
export { default as groupBusiness } from './group/group'

// User模块
export { default as userBusiness } from './user/user'

// Notification模块
export { default as notificationInboxBusiness } from './notification/inbox'
export { default as notificationReadCursorBusiness } from './notification/read-cursor'
export { default as notificationEventBusiness } from './notification/event'

// Emoji模块（按表拆分，按需各自引用）
