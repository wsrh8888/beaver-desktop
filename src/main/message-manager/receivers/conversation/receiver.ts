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

import dBServiceChatConversation  from 'mainModule/database/services/chat/conversation'
import dbServiceChatUserConversation  from 'mainModule/database/services/chat/user-conversation'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

/**
 * 会话操作数据接口
 */
interface ConversationOperationData {
  operation: string
  conversationId: string
  userId: string
  data?: any
  timestamp: number
}

/**
 * @description: 会话操作接收器 - 处理会话相关的操作
 */
class ConversationReceiver {
  protected readonly receiverName = 'ConversationReceiver'
  protected readonly logger = new Logger(this.receiverName)

  constructor() {
    // 会话操作需要快速响应

  }

  /**
   * 批量处理会话操作
   */
  protected async processBatchMessages(messages: ConversationOperationData[]): Promise<void> {
    // 按操作类型分组处理
    const operations = new Map<string, ConversationOperationData[]>()

    for (const message of messages) {
      if (!operations.has(message.operation)) {
        operations.set(message.operation, [])
      }
      operations.get(message.operation)!.push(message)
    }

    // 逐个操作类型处理
    for (const [operation, operationMessages] of operations) {
      switch (operation) {
        case 'conversation_create':
          await this.handleConversationCreate(operationMessages)
          break
        case 'conversation_update':
          await this.handleConversationUpdate(operationMessages)
          break
        case 'conversation_delete':
          await this.handleConversationDelete(operationMessages)
          break
        case 'conversation_read':
          await this.handleConversationRead(operationMessages)
          break
        default:
          logger.warn({
            text: '收到未知的会话操作类型',
            data: { operation, count: operationMessages.length },
          })
      }
    }
  }

  /**
   * 处理会话创建
   */
  private async handleConversationCreate(messages: ConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    for (const message of messages) {
      try {
        // 创建会话元数据
        await dBServiceChatConversation.create({
          conversationId: message.conversationId,
          type: message.data?.type || 1,
          maxSeq: 0,
          lastMessage: '',
          version: 1,
        })

        // 创建用户会话关系
        await dbServiceChatUserConversation.create({
          userConversationData: {
            userId: currentUserId,
            conversationId: message.conversationId,
            isHidden: 0,
            isPinned: 0,
            isMuted: 0,
            userReadSeq: 0,
            version: 1,
          }
        })

        logger.info({
          text: '会话创建成功',
          data: { conversationId: message.conversationId, userId: currentUserId },
        })
      }
      catch (error) {
        logger.error({
          text: '会话创建失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        })
      }
    }
  }

  /**
   * 处理会话更新
   */
  private async handleConversationUpdate(messages: ConversationOperationData[]): Promise<void> {
    for (const message of messages) {
      try {
        // 更新会话元数据
        if (message.data?.lastMessage) {
          await dBServiceChatConversation.updateLastMessage(
            message.conversationId,
            message.data.lastMessage,
          )
        }

        logger.info({
          text: '会话更新成功',
          data: { conversationId: message.conversationId },
        })
      }
      catch (error) {
        logger.error({
          text: '会话更新失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        })
      }
    }
  }

  /**
   * 处理会话删除
   */
  private async handleConversationDelete(messages: ConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    for (const message of messages) {
      try {
        // 软删除：将用户会话标记为隐藏
        await dbServiceChatUserConversation.batchCreate({
          userConversations: [{
            userId: currentUserId,
            conversationId: message.conversationId,
            isHidden: 1,
            version: Date.now(),
          }]
        })

        logger.info({
          text: '会话删除成功',
          data: { conversationId: message.conversationId, userId: currentUserId },
        })
      }
      catch (error) {
        logger.error({
          text: '会话删除失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        })
      }
    }
  }

  /**
   * 处理会话已读
   */
  private async handleConversationRead(messages: ConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    for (const message of messages) {
      try {
        const readSeq = message.data?.readSeq || 0

        // 更新用户已读序列号
        await dbServiceChatUserConversation.batchCreate({
          userConversations: [{
            userId: currentUserId,
            conversationId: message.conversationId,
            userReadSeq: readSeq,
            version: Date.now(),
          }]
        })

        logger.info({
          text: '会话已读更新成功',
          data: { conversationId: message.conversationId, readSeq, userId: currentUserId },
        })
      }
      catch (error) {
        logger.error({
          text: '会话已读更新失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        })
      }
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | null {
    const userStore = store.get('userInfo')
    return userStore?.userId || null
  }
}

export default new ConversationReceiver()