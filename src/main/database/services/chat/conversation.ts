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

import { eq, inArray } from 'drizzle-orm'
import { chatConversations } from 'mainModule/database/tables/chat/conversation'
import { BaseService } from '../base'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('conversation')

import type {

  DBCreateConversationReq,
  DBUpsertConversationReq,
  DBBatchCreateConversationsReq,
  DBGetAllConversationsReq,
  DBGetAllConversationsRes,
  DBGetConversationsByIdsReq,
  DBGetConversationsByIdsRes,
  DBGetConversationByIdReq,
  DBGetConversationByIdRes,
  DBGetConversationsByTypeReq,
  DBGetConversationsByTypeRes,
  DBUpdateLastMessageReq,
} from 'commonModule/type/database/server/chat/conversation'

// 聊天会话服务
class ChatConversation extends BaseService {
  /**
   * @description 创建单个会话
   */
  async create(req: DBCreateConversationReq): Promise<void> {
    logger.info({ text: 'create 开始' })
    await this.db.insert(chatConversations).values(req).run()
  }

  /**
   * @description upsert单个会话（插入或更新）
   */
  async upsert(req: DBUpsertConversationReq): Promise<void> {
    logger.info({ text: 'upsert 开始' })
    // 处理字段名映射：API返回的 createdAt/updatedAt 映射到数据库的 createdAt/updatedAt
    const dbData = {
      conversationId: req.conversationId,
      type: req.type,
      maxSeq: req.maxSeq,
      lastMessage: req.lastMessage,
      version: req.version,
      createdAt: req.createdAt, // API返回的是 createdAt
      updatedAt: req.updatedAt, // API返回的是 updatedAt
    }

    await this.db
      .insert(chatConversations)
      .values(dbData)
      .onConflictDoUpdate({
        target: chatConversations.conversationId,
        set: {
          type: dbData.type,
          maxSeq: dbData.maxSeq,
          lastMessage: dbData.lastMessage,
          version: dbData.version,
          updatedAt: dbData.updatedAt,
        },
      })
      .run()
  }

  /**
   * @description 批量创建会话（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateConversationsReq): Promise<void> {
    logger.info({ text: 'batchCreate 开始' })
    if (req.conversations.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const conversation of req.conversations) {
      // 处理字段名映射：API返回的 createdAt/updatedAt 映射到数据库的 createdAt/updatedAt
      const dbData = {
        conversationId: conversation.conversationId,
        type: conversation.type,
        maxSeq: conversation.maxSeq,
        lastMessage: conversation.lastMessage,
        version: conversation.version,
        createdAt: conversation.createdAt, // API返回的是 createdAt
        updatedAt: conversation.updatedAt, // API返回的是 updatedAt
      }

      await this.db
        .insert(chatConversations)
        .values(dbData)
        .onConflictDoUpdate({
          target: chatConversations.conversationId,
          set: {
            type: dbData.type,
            maxSeq: dbData.maxSeq,
            lastMessage: dbData.lastMessage,
            version: dbData.version,
            updatedAt: dbData.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 获取所有会话（本地数据库场景，支持分页）
   */
  async getAllConversations(req: DBGetAllConversationsReq): Promise<DBGetAllConversationsRes> {
    logger.info({ text: 'getAllConversations 开始' })
    const { page = 1, limit } = req

    let query = this.db.select().from(chatConversations)

    // 如果指定了limit，则应用分页
    if (limit) {
      const offset = (page - 1) * limit
      query = query.limit(limit).offset(offset)
    }

    return await query.all()
  }

  /**
   * @description 根据会话ID列表批量获取会话元数据（包含最后消息）
   */
  async getConversationsByIds(req: DBGetConversationsByIdsReq): Promise<DBGetConversationsByIdsRes> {
    logger.info({ text: 'getConversationsByIds 开始' })
    if (req.conversationIds.length === 0)
      return []
    const conversations = await this.db.select().from(chatConversations).where(inArray(chatConversations.conversationId as any, req.conversationIds as any)).all()
    return conversations
  }

  /**
   * @description 根据会话ID获取单个会话元数据
   */
  async getConversationById(req: DBGetConversationByIdReq): Promise<DBGetConversationByIdRes> {
    logger.info({ text: 'getConversationById 开始' })
    const conversation = await this.db.select().from(chatConversations).where(eq(chatConversations.conversationId as any, req.conversationId as any)).get()
    return { conversation }
  }

  /**
   * @description 根据类型获取会话（纯数据库查询）
   */
  async getConversationsByType(req: DBGetConversationsByTypeReq): Promise<DBGetConversationsByTypeRes> {
    logger.info({ text: 'getConversationsByType 开始' })
    const conversations = await this.db.select().from(chatConversations).where(eq(chatConversations.type as any, req.type as any)).all()
    return conversations
  }

  /**
   * @description 更新会话的最后消息
   */
  async updateLastMessage(req: DBUpdateLastMessageReq): Promise<void> {
    logger.info({ text: 'updateLastMessage 开始' })
    const updateData: any = {
      lastMessage: req.lastMessage,
      updatedAt: Math.floor(Date.now() / 1000), // 使用秒级时间戳
    }
    if (req.maxSeq !== undefined) {
      updateData.maxSeq = req.maxSeq
    }
    await this.db.update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.conversationId as any, req.conversationId))
      .run()
  }
}

// 导出聊天会话服务实例
export default new ChatConversation()
