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

import messageSync from './chat-message'
import conversationMetaSync from './conversation-meta'
import messageMediaSync from './message-media'
import userConversationSync from './user-conversation'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('index')


// 聊天数据同步统一入口
export const chatDatasync = new class ChatDatasync {
  async checkAndSync() {
    logger.info({ text: 'checkAndSync 开始' })
    await Promise.all([
      userConversationSync.checkAndSync(),
      conversationMetaSync.checkAndSync(),
      messageSync.checkAndSync(),
      messageMediaSync.checkAndSync(),
    ])
  }
}()
