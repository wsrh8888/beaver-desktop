// 聊天同步状态服务 - 使用独立的chatSyncStatus表
import { and, eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { chatSyncStatus } from '../../tables/chat/sync-status'
import type {
  DBGetSyncStatusReq,
  DBGetSyncStatusRes,
  DBGetMessageSyncStatusReq,
  DBGetMessageSyncStatusRes,
  DBGetConversationSyncStatusReq,
  DBGetConversationSyncStatusRes,
  DBGetUserConversationSyncStatusReq,
  DBGetUserConversationSyncStatusRes,
  DBGetSyncStatusesReq,
  DBGetSyncStatusesRes,
  DBGetConversationVersionsReq,
  DBGetConversationVersionsRes,
  DBGetMessageVersionsReq,
  DBGetMessageVersionsRes,
  DBGetUserConversationVersionsReq,
  DBGetUserConversationVersionsRes,
  DBGetAllSyncStatusReq,
  DBGetAllSyncStatusRes,
} from 'commonModule/type/database/server/chat/sync-status'

class ChatSyncStatusService extends BaseService {
  /**
   * @description 获取指定模块的同步状态
   */
  async getSyncStatus(req: DBGetSyncStatusReq): Promise<DBGetSyncStatusRes> {
    const syncStatus = await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, req.module), eq(chatSyncStatus.conversationId, req.conversationId))).get()
    return { syncStatus }
  }

  /**
   * @description 获取消息同步状态
   */
  async getMessageSyncStatus(req: DBGetMessageSyncStatusReq): Promise<DBGetMessageSyncStatusRes> {
    return await this.getSyncStatus({ module: 'message', conversationId: req.conversationId })
  }

  /**
   * @description 获取会话同步状态
   */
  async getConversationSyncStatus(req: DBGetConversationSyncStatusReq): Promise<DBGetConversationSyncStatusRes> {
    return await this.getSyncStatus({ module: 'conversation', conversationId: req.conversationId })
  }

  /**
   * @description 获取用户会话同步状态
   */
  async getUserConversationSyncStatus(req: DBGetUserConversationSyncStatusReq): Promise<DBGetUserConversationSyncStatusRes> {
    return await this.getSyncStatus({ module: 'user_conversation', conversationId: req.conversationId })
  }

  /**
   * @description 批量获取同步状态
   */
  async getSyncStatuses(req: DBGetSyncStatusesReq): Promise<DBGetSyncStatusesRes> {
    if (req.conversationIds.length === 0)
      return { syncStatuses: [] }
    const syncStatuses = await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, req.module), inArray(chatSyncStatus.conversationId, req.conversationIds))).all()
    return { syncStatuses }
  }

  /**
   * @description 批量获取会话版本状态
   */
  async getConversationVersions(req: DBGetConversationVersionsReq): Promise<DBGetConversationVersionsRes> {
    const { syncStatuses } = await this.getSyncStatuses({ module: 'conversation', conversationIds: req.conversationIds })
    const versions = syncStatuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
    return { versions }
  }

  // 批量获取消息版本状态
  async getMessageVersions(conversationIds: string[]): Promise<Array<{ conversationId: string, seq: number }>> {
    const statuses = await this.getSyncStatuses('message', conversationIds)
    return statuses.map(status => ({
      conversationId: status.conversationId,
      seq: status.seq || 0,
    }))
  }

  // 批量获取用户会话版本状态
  async getUserConversationVersions(conversationIds: string[]): Promise<Array<{ conversationId: string, version: number }>> {
    const statuses = await this.getSyncStatuses('user_conversation', conversationIds)
    return statuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
  }

  // 获取所有同步状态
  async getAllSyncStatus() {
    return await this.db.select().from(chatSyncStatus).all()
  }

  // 更新或插入同步状态
  async upsertSyncStatus(
    module: string,
    conversationId: string,
    seq: number = 0,
    version: number = 0,
  ): Promise<void> {
    await this.db
      .insert(chatSyncStatus)
      .values({
        module,
        conversationId,
        seq: module === 'message' ? seq : 0,
        version: module !== 'message' ? version : 0,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: [chatSyncStatus.conversationId, chatSyncStatus.module],
        set: {
          seq: module === 'message' ? seq : undefined,
          version: module !== 'message' ? version : undefined,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 更新消息同步状态
  async upsertMessageSyncStatus(conversationId: string, seq: number): Promise<void> {
    return this.upsertSyncStatus('message', conversationId, seq, 0)
  }

  // 更新会话同步状态
  async upsertConversationSyncStatus(conversationId: string, version: number): Promise<void> {
    return this.upsertSyncStatus('conversation', conversationId, 0, version)
  }

  // 更新用户会话同步状态
   async upsertUserConversationSyncStatus(conversationId: string, version: number): Promise<void> {
    return this.upsertSyncStatus('user_conversation', conversationId, 0, version)
  }

  // 批量更新同步状态
   async batchUpsertSyncStatus(statuses: Array<{
    module: string
    conversationId: string
    seq?: number
    version?: number
  }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertSyncStatus(
        status.module,
        status.conversationId,
        status.seq || 0,
        status.version || 0,
      )
    }
  }

  // 删除同步状态
   async deleteSyncStatus(module: string, conversationId: string) {
    return await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, module), eq(chatSyncStatus.conversationId, conversationId)))
      .run()
  }

  // 批量删除同步状态
   async batchDeleteSyncStatus(module: string, conversationIds: string[]) {
    if (conversationIds.length === 0)
      return
    return await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, module), inArray(chatSyncStatus.conversationId, conversationIds)))
      .all()
  }

  // 获取需要同步的会话列表（基于消息序列号）
   async getConversationsNeedMessageSync(serverSeqs: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getSyncStatuses('message', Object.keys(serverSeqs))
    const statusMap = new Map(localStatuses.map(s => [s.conversationId, s]))

    const needSync: string[] = []

    for (const [conversationId, serverSeq] of Object.entries(serverSeqs)) {
      const localStatus = statusMap.get(conversationId)
      const localSeq = localStatus?.seq || 0

      if (localSeq < serverSeq) {
        needSync.push(conversationId)
      }
    }

    return needSync
  }

  // 清空所有同步状态（用于重置）
   async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(chatSyncStatus).run()
  }
}

// 导出聊天同步状态服务实例
export default new ChatSyncStatusService()
