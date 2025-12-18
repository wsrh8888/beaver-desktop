import { and, desc, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { chats } from 'mainModule/database/tables/chat/message'
import { BaseService } from '../base'
import type {
  DBCreateMessageReq,
  DBBatchCreateMessagesReq,
  DBBatchUpdateSendStatusReq,
  DBGetChatHistoryReq,
  DBGetChatHistoryRes,
  DBGetChatMessagesBySeqRangeReq,
  DBGetChatMessagesBySeqRangeRes,
} from 'commonModule/type/database/server/chat/message'

// 消息服务
class MessageService extends BaseService {
  /**
   * @description 创建单条消息
   */
  async create(req: DBCreateMessageReq): Promise<void> {
    await this.db.insert(chats).values(req).run()
  }

  /**
   * @description 批量创建消息（一次性插入所有消息，如果重复则更新关键字段）
   */
  async batchCreate(req: DBBatchCreateMessagesReq): Promise<void> {
    if (req.messages.length === 0)
      return

    // 一次性批量插入所有消息，如果messageId重复则更新关键字段（seq, sendStatus等）
    await this.db.insert(chats).values(req.messages as any).onConflictDoUpdate({
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

  /**
   * @description 批量更新消息的发送状态（用于收到服务器消息后，更新本地已发送消息的状态）
   */
  async batchUpdateSendStatus(req: DBBatchUpdateSendStatusReq): Promise<void> {
    if (req.messageIds.length === 0)
      return

    // 如果有seqMap，需要逐个更新（因为每条消息的seq可能不同）
    if (req.seqMap && req.seqMap.size > 0) {
      for (const messageId of req.messageIds) {
        const seq = req.seqMap.get(messageId)
        const updateData: any = {
          sendStatus: req.sendStatus as number,
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
        .set({ sendStatus: req.sendStatus as number, updatedAt: Math.floor(Date.now() / 1000) })
        .where(inArray(chats.messageId as any, req.messageIds as any))
        .run()
    }
  }

  /**
   * @description 获取会话的历史消息（纯数据库查询，不含业务逻辑）
   */
  async getChatHistory(req: DBGetChatHistoryReq): Promise<DBGetChatHistoryRes> {
    const { seq, limit = 20 } = req

    let query = this.db.select().from(chats).where(eq(chats.conversationId as any, req.conversationId as any))

    if (seq !== undefined && seq !== null) {
      // 如果传入了seq，加载比这个seq更小的消息（历史消息）
      query = query.where(lt(chats.seq as any, seq))
    }

    // 获取消息列表 - 按seq降序排列，确保最新的消息在前
    // limit + 1 用于判断是否还有更多数据
    const messages = await query.orderBy(desc(chats.seq as any)).limit(limit + 1).all()
    return { messages }
  }

  /**
   * @description 按序列号范围获取消息（纯数据库查询，不含业务逻辑）
   */
  async getChatMessagesBySeqRange(req: DBGetChatMessagesBySeqRangeReq): Promise<DBGetChatMessagesBySeqRangeRes> {
    const messages = await this.db.select().from(chats).where(
      and(
        gte(chats.seq as any, req.startSeq as any),
        lte(chats.seq as any, req.endSeq as any),
        eq(chats.conversationId as any, req.conversationId as any),
      ),
    ).orderBy(chats.seq, 'asc').all()
    return { messages }
  }
}

// 导出消息服务实例
export default new MessageService()
