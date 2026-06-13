import type { IDBChatMessageMedia } from '../../db/chat'

export interface DBBatchCreateMessageMediasReq {
  records: Array<Pick<IDBChatMessageMedia, 'userId' | 'messageId' | 'version' | 'createdAt'>>
}

export interface DBBatchCreateMessageMediasRes {
  success: boolean
}

export interface DBGetMessageMediaIdsReq {
  userId: string
}

export interface DBGetMessageMediaIdsRes {
  messageIds: string[]
}
