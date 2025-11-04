export interface IDBChatMessage {
  id?: number
  messageId: string
  conversationId: string
  conversationType: number
  seq?: number
  sendUserId?: string
  msgType: number
  targetMessageId?: string
  msgPreview: string
  msg?: string
  createdAt?: number
  updatedAt?: number
}
