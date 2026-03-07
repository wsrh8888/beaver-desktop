export interface IMessageMsg {
  type: number
  textMsg?: { content: string }
  imageMsg?: { fileKey: string, width: number, height: number } | null
  videoMsg?: { fileKey: string, width: number, height: number, duration: number } | null
  fileMsg?: { fileKey: string, fileName: string, size: number, mimeType: string } | null
  voiceMsg?: { fileKey: string, duration: number, size: number } | null
  emojiMsg?: { fileKey: string, emojiId: string, packageId: string, width: number, height: number } | null
  notificationMsg?: { type: number, actors: string[] } | null
  audioFileMsg?: { fileKey: string, fileName: string, duration: number, size: number } | null
  withdrawMsg?: { originMsgId: string, originMsg?: any } | null
  replyMsg?: { originMsgId: string, originMsg?: any, replyMsg?: any } | null
  callMsg?: { roomId: string, callType: number, status: number, duration: number } | null
}

// WebSocket 消息发送者信息
export interface IMessageSender {
  avatar?: string
  nickName?: string
  userId: string
}

// WebSocket 消息体 - 私聊消息接收
export interface IPrivateMessageReceiveBody {
  conversationId: string
  conversationType: number
  createdAt: string
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

// WebSocket 消息体 - 聊天消息发送 (统一私聊与群聊)
export interface IChatMessageSendBody {
  conversationId: string
  messageId: string // 客户端消息ID
  msg: IMessageMsg
  chatType: 'private' | 'group'
}

/** @deprecated Use IChatMessageSendBody instead */
export type IPrivateMessageSendBody = IChatMessageSendBody

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
