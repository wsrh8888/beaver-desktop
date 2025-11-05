// 消息类型枚举（数据库存储）
export enum MessageType {
  TEXT = 1, // 文本消息
  IMAGE = 2, // 图片消息
  VIDEO = 3, // 视频消息
  FILE = 4, // 文件消息
  VOICE = 5, // 语音消息
  EMOJI = 6, // 表情消息
  RECALL = 7, // 撤回消息
  DELETE = 8, // 删除消息
  SYSTEM = 9, // 系统消息
}

// 发送状态枚举（数据库存储）
export enum SendStatus {
  SENDING = 0, // 发送中
  SENT = 1, // 已发送
  FAILED = 2, // 发送失败
}

// 聊天消息表
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
  sendStatus?: SendStatus // 发送状态 (0=发送中 1=已发送 2=发送失败) - 仅客户端使用
  createdAt?: number
  updatedAt?: number
}

// 聊天会话元数据表
export interface IDBChatConversationMeta {
  id?: number
  conversationId: string
  type: number
  maxSeq?: number
  lastMessage?: string
  version?: number
  createdAt?: number
  updatedAt?: number
}

// 用户会话表
export interface IDBChatUserConversation {
  id?: number
  userId: string
  conversationId: string
  isHidden?: number
  isPinned?: number
  isMuted?: number
  userReadSeq?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}
