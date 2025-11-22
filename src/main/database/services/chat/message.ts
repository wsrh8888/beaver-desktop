import { and, desc, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { chats } from 'mainModule/database/tables/chat/message'
import dbManager from '../../db'

// 消息服务
export class MessageService {
  static get db() {
    return dbManager.db
  }

  // 创建单条消息
  static async create(messageData: any) {
    return await this.db.insert(chats).values(messageData).run()
  }

  // 批量创建消息（一次性插入所有消息，如果重复则更新关键字段）
  static async batchCreate(messages: any[]) {
    if (messages.length === 0)
      return

    // 一次性批量插入所有消息，如果messageId重复则更新关键字段（seq, sendStatus等）
    return await this.db.insert(chats).values(messages).onConflictDoUpdate({
      target: chats.messageId,
      set: {
        seq: sql.raw(`excluded.seq`),
        sendStatus: sql.raw(`excluded.send_status`),
        msgPreview: sql.raw(`excluded.msg_preview`),
        msg: sql.raw(`excluded.msg`),
        updatedAt: sql.raw(`excluded.updated_at`),
      },
    }).run()
  }

  // 批量更新消息的发送状态（用于收到服务器消息后，更新本地已发送消息的状态）
  // seqMap: messageId -> seq 的映射，用于同时更新seq值
  static async batchUpdateSendStatus(messageIds: string[], sendStatus: number, seqMap?: Map<string, number>) {
    if (messageIds.length === 0)
      return

    // 如果有seqMap，需要逐个更新（因为每条消息的seq可能不同）
    if (seqMap && seqMap.size > 0) {
      for (const messageId of messageIds) {
        const seq = seqMap.get(messageId)
        const updateData: any = {
          sendStatus,
          updatedAt: Math.floor(Date.now() / 1000),
        }
        if (seq !== undefined) {
          updateData.seq = seq
        }
        await this.db.update(chats)
          .set(updateData)
          .where(eq(chats.messageId as any, messageId as any))
          .run()
      }
    }
    else {
      // 如果没有seqMap，批量更新所有消息的send_status（使用inArray一次性更新所有消息）
      await this.db.update(chats)
        .set({ sendStatus, updatedAt: Math.floor(Date.now() / 1000) })
        .where(inArray(chats.messageId as any, messageIds as any))
        .run()
    }
  }

  // 获取会话的历史消息（纯数据库查询，不含业务逻辑）
  static async getChatHistory(conversationId: string, options?: { seq?: number, limit?: number }): Promise<any[]> {
    const { seq, limit = 20 } = options || {}

    let query = this.db.select().from(chats).where(eq(chats.conversationId as any, conversationId as any))

    if (seq !== undefined && seq !== null) {
      // 如果传入了seq，加载比这个seq更小的消息（历史消息）
      query = query.where(lt(chats.seq as any, seq))
    }

    // 获取消息列表 - 按seq降序排列，确保最新的消息在前
    // limit + 1 用于判断是否还有更多数据
    return await query.orderBy(desc(chats.seq as any)).limit(limit + 1).all()
  }

  // 按序列号范围获取消息（纯数据库查询，不含业务逻辑）
  static async getChatMessagesBySeqRange(conversationId: string, startSeq: number, endSeq: number): Promise<any[]> {
    return await this.db.select().from(chats).where(
      and(
        gte(chats.seq as any, startSeq as any),
        lte(chats.seq as any, endSeq as any),
        eq(chats.conversationId as any, conversationId as any),
      ),
    ).orderBy(chats.seq, 'asc').all()
  }
}
