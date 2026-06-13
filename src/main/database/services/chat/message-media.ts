import { eq } from 'drizzle-orm'
import type {
  DBBatchCreateMessageMediasReq,
  DBBatchCreateMessageMediasRes,
  DBGetMessageMediaIdsReq,
  DBGetMessageMediaIdsRes,
} from 'commonModule/type/database/server/chat/message-media'
import { chatMessageMedias } from 'mainModule/database/tables/chat/message-media'
import { BaseService } from '../base'

class ChatMessageMediaService extends BaseService {
  async batchCreate(req: DBBatchCreateMessageMediasReq): Promise<DBBatchCreateMessageMediasRes> {
    const { records } = req
    if (records.length === 0)
      return { success: true }

    for (const record of records) {
      await this.db
        .insert(chatMessageMedias)
        .values(record)
        .onConflictDoNothing()
        .run()
    }

    return { success: true }
  }

  async getMessageIds(req: DBGetMessageMediaIdsReq): Promise<DBGetMessageMediaIdsRes> {
    const rows = await this.db
      .select({ messageId: chatMessageMedias.messageId })
      .from(chatMessageMedias)
      .where(eq(chatMessageMedias.userId, req.userId as any))
      .all()

    return {
      messageIds: rows.map(row => row.messageId),
    }
  }
}

export default new ChatMessageMediaService()
