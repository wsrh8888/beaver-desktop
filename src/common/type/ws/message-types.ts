// 聊天消息内容类型
export interface IMessageMsg {
  type: number
  textMsg?: { content: string }
  imageMsg?: { src: string } | null
  videoMsg?: { src: string } | null
  fileMsg?: { name: string, size: number, url: string, type: string } | null
  voiceMsg?: { src: string, duration: number } | null
  emojiMsg?: { emoji: string } | null
  atMsg?: { content: string, atUsers: string[] } | null
  replyMsg?: { replyToMessageId: string, replyContent: string } | null
}
export interface IPrivateMessageSendBody {
  conversationId: string
  msg: IMessageMsg
}
