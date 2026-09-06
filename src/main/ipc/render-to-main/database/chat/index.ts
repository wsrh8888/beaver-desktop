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

import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataChatCommand } from 'commonModule/type/ipc/database'
import conversationBusiness from 'mainModule/business/chat/conversation'
import messageBusiness from 'mainModule/business/chat/message'
import dbServiceChatUserConversation from 'mainModule/database/services/chat/user-conversation'
import dbServiceChatMessageMedia from 'mainModule/database/services/chat/message-media'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('index')


class ChatHandler {
  /**
   * 处理聊天相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataChatCommand, data: any, header: ICommonHeader): Promise<any> {
    logger.info({ text: 'handle 开始' })
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }
    switch (command) {
      case DataChatCommand.GET_RECENT_CHAT_LIST:
        return await conversationBusiness.getAggregatedRecentChatList(header, data)
      case DataChatCommand.GET_CONVERSATION_INFO:
        return await conversationBusiness.getConversationInfo(header, data)
      case DataChatCommand.GET_CHAT_HISTORY:
        return await messageBusiness.getChatHistory(header, data)
      case DataChatCommand.GET_CHAT_MESSAGES_BY_SEQ_RANGE:
        return await messageBusiness.getChatMessagesBySeqRange(header, data)
      case DataChatCommand.GET_CHAT_CONVERSATIONS_BY_VER_RANGE:
        return await dbServiceChatUserConversation.getChatConversationsByVerRange({ header, params: data })
      case DataChatCommand.DELETE_MESSAGES:
        return await messageBusiness.batchDelete(header, data)
      case DataChatCommand.GET_MESSAGE_MEDIA_IDS:
        return await dbServiceChatMessageMedia.getMessageIds({ userId: userStore.userId })
      case DataChatCommand.HIDE_CONVERSATION:
        await dbServiceChatUserConversation.updateSettings({
          userId: header.userId,
          conversationId: data.conversationId,
          settings: { isHidden: 1 },
        })
        return { success: true }
      default:
        throw new Error('聊天数据库命令处理失败ChatHandler')
    }
  }
}

export default new ChatHandler()
