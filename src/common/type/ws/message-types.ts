// 聊天消息内容类型
export interface IMessageMsg {
  type: number
  textMsg?: { content: string }
  imageMsg?: { fileKey: string, width: number, height: number } | null
  videoMsg?: { fileKey: string, width: number, height: number, duration: number } | null
  fileMsg?: { name: string, size: number, url: string, type: string } | null
  voiceMsg?: { src: string, duration: number } | null
  emojiMsg?: { emoji: string } | null
  atMsg?: { content: string, atUsers: string[] } | null
  replyMsg?: { replyToMessageId: string, replyContent: string } | null
}

// WebSocket 消息发送者信息
export interface IMessageSender {
  avatar?: string
  nickname?: string
  userId: string
}

// WebSocket 消息体 - 私聊消息接收
export interface IPrivateMessageReceiveBody {
  conversationId: string
  conversationType: number
  createAt: string
  id?: number
  messageId: string
  msg: IMessageMsg
  msgPreview: string
  sender: IMessageSender
  seq: number
  status?: number
}

// WebSocket 消息体 - 私聊消息同步
export interface IPrivateMessageSyncBody extends IPrivateMessageReceiveBody {
  // 同步消息与接收消息结构相同
}

// WebSocket 消息体 - 私聊消息发送
export interface IPrivateMessageSendBody {
  conversationId: string
  messageId: string // 客户端消息ID
  msg: IMessageMsg
}

// 表更新数据格式
export interface ITableUpdate {
  table: 'messages' | 'conversations' | 'user_conversations'
  conversationId?: string
  userId?: string
  data: Array<{
    seq?: number
    version?: number
  }>
}

// WebSocket 消息体 - 基于表的更新通知
export interface ITableUpdatesBody {
  tableUpdates: ITableUpdate[]
}