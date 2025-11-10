import type { IChatHistoryRes, IChatMessageVerRangeRes } from 'commonModule/type/ajax/chat'
import { and, desc, eq, gte, inArray, lt, lte } from 'drizzle-orm'
import { chats } from 'mainModule/database/tables/chat/message'
import dbManager from '../../db'
import { UserService } from '../user/user'

// 消息服务
export class MessageService {
  static get db() {
    return dbManager.db
  }

  // 创建单条消息
  static async create(messageData: any) {
    return await this.db.insert(chats).values(messageData).run()
  }

  // 批量创建消息（一次性插入所有消息，忽略重复数据）
  static async batchCreate(messages: any[]) {
    if (messages.length === 0)
      return

    // 一次性批量插入所有消息，如果messageId重复则忽略（避免重复插入）
    return await this.db.insert(chats).values(messages).onConflictDoNothing({ target: chats.messageId }).run()
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

  // 获取会话的历史消息
  static async getChatHistory(header: any, params: any): Promise<IChatHistoryRes> {
    // 前端可能传递 conversation 或 conversationId
    const conversationId = params.conversationId || params.conversation
    const seq = params.seq // 可选，用于加载历史消息（比这个seq更小的消息）
    const limit = params.limit || 20
    const currentUserId = String(header.userId) // 当前用户ID

    console.log('[DEBUG] getChatHistory params:', { conversationId, seq, limit, currentUserId })

    let query = this.db.select().from(chats).where(eq(chats.conversationId as any, conversationId as any))

    if (seq !== undefined && seq !== null) {
      // 如果传入了seq，加载比这个seq更小的消息（历史消息）
      // 使用 lt(seq) 而不是 lte(seq) 来避免重复加载
      query = query.where(lt(chats.seq as any, seq))
    }

    // 获取消息列表 - 按seq降序排列，确保最新的消息在前
    // limit + 1 用于判断是否还有更多数据
    const messages = await query.orderBy(desc(chats.seq as any)).limit(limit + 1).all()

    console.log('[DEBUG] Found messages:', messages.length, 'for conversationId:', conversationId)
    console.log('[DEBUG] First few messages seq:', messages.slice(0, 5).map((m: any) => ({ seq: m.seq, messageId: m.messageId })))
    console.log('[DEBUG] Last few messages seq:', messages.slice(-5).map((m: any) => ({ seq: m.seq, messageId: m.messageId })))

    // 判断是否还有更多数据（返回 limit+1 条，如果超过 limit 条说明有更多数据）
    const hasMore = messages.length > limit
    const actualMessages = hasMore ? messages.slice(0, limit) : messages

    // 获取所有发送者ID（排除空值）
    const senderIds = [...new Set(actualMessages.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]

    // 获取发送者信息
    const senderInfoMap = new Map()
    if (senderIds.length > 0) {
      try {
        const senderDetails = await UserService.getUsersBasicInfo(senderIds as string[])
        senderDetails.forEach((detail) => {
          senderInfoMap.set(detail.userId, {
            userId: detail.userId,
            nickname: detail.nickName,
            avatar: detail.avatar,
          })
        })
      }
      catch (error) {
        console.warn('[DEBUG] Failed to get sender details:', error)
      }
    }

    // 转换数据格式以匹配前端期望的API响应格式
    const formattedMessages = actualMessages.map((message: any) => {
      const senderDetail = senderInfoMap.get(message.sendUserId)

      return {
        id: message.id,
        messageId: message.messageId,
        conversationId: message.conversationId,
        seq: message.seq,
        msg: typeof message.msg === 'string' ? JSON.parse(message.msg) : message.msg, // 解析JSON字符串
        sender: {
          userId: message.sendUserId || '',
          avatar: senderDetail?.avatar || '',
          nickname: senderDetail?.nickname || (message.sendUserId ? '用户' : '系统消息'),
        },
        create_at: new Date(message.createdAt * 1000).toISOString().slice(0, 19).replace('T', ' '), // 转换为前端期望的格式
        status: 0, // 消息状态：正常（只增不修改原则）
        sendStatus: message.sendStatus || 0, // 发送状态（前端需要）
      }
    })

    return {
      count: formattedMessages.length, // 当前页的数量
      list: formattedMessages,
    }
  }

  // 按序列号范围获取消息（用于数据同步）
  static async getChatMessagesBySeqRange(_header: any, params: any): Promise<IChatMessageVerRangeRes> {
    const { startSeq, endSeq, conversationId } = params
    console.log(`[DEBUG] getChatMessagesBySeqRange called with:`, { startSeq, endSeq, conversationId, startSeqType: typeof startSeq, endSeqType: typeof endSeq })

    // 构建基础查询
    let query = this.db.select().from(chats)

    // 应用复合条件：seq 范围 + conversationId
    console.log(`[DEBUG] Applying filters: seq >= ${startSeq} AND seq <= ${endSeq} AND conversationId = ${conversationId}`)

    query = query.where(
      and(
        gte(chats.seq as any, startSeq as any),
        lte(chats.seq as any, endSeq as any),
        eq(chats.conversationId as any, conversationId as any),
      ),
    )

    // 排序
    query = query.orderBy(chats.seq, 'asc')

    console.log(`[DEBUG] Query built, executing...`)

    const result = await query.all()
    console.log(`[DEBUG] Query result: found ${result.length} messages`)

    if (result.length > 0) {
      // 检查结果中的 conversationId 是否一致
      const uniqueConversations = [...new Set(result.map((m: any) => m.conversationId))]
      console.log(`[DEBUG] Unique conversationIds in result:`, uniqueConversations)

      // 检查 seq 值分布
      const seqCounts = result.reduce((acc: Record<number, number>, msg: any) => {
        acc[msg.seq] = (acc[msg.seq] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      console.log(`[DEBUG] Seq distribution:`, seqCounts)

      console.log(`[DEBUG] Sample messages:`, result.slice(0, 3).map((m: any) => ({
        id: m.id,
        messageId: m.messageId,
        seq: m.seq,
        conversationId: m.conversationId,
      })))
    }

    // 获取发送者信息（同步接口也需要完整用户信息）
    const senderIds = [...new Set(result.map((m: any) => m.sendUserId).filter((id: string) => id && id.trim()))]
    const senderInfoMap = new Map()
    if (senderIds.length > 0) {
      try {
        const senderDetails = await UserService.getUsersBasicInfo(senderIds as string[])
        senderDetails.forEach((detail) => {
          senderInfoMap.set(detail.userId, {
            userId: detail.userId,
            nickname: detail.nickName,
            avatar: detail.avatar,
          })
        })
      }
      catch (error) {
        console.warn('[DEBUG] Failed to get sender details in seq range query:', error)
      }
    }

    // 转换为 IChatHistory 格式
    const formattedMessages = result.map((message: any) => {
      const senderDetail = senderInfoMap.get(message.sendUserId)
      return {
        id: message.id,
        messageId: message.messageId,
        conversationId: message.conversationId,
        seq: message.seq,
        msg: typeof message.msg === 'string' ? JSON.parse(message.msg) : message.msg, // 解析JSON字符串
        sender: {
          userId: message.sendUserId || '',
          avatar: senderDetail?.avatar || '',
          nickname: senderDetail?.nickname || (message.sendUserId ? '用户' : '系统消息'),
        },
        create_at: new Date(message.createdAt * 1000).toISOString().slice(0, 19).replace('T', ' '), // 转换为前端期望的格式
        status: 0, // 消息状态：正常（只增不修改原则）
        sendStatus: message.sendStatus || 1, // 发送状态（客户端使用）
      }
    })

    return {
      list: formattedMessages,
    }
  }
}
