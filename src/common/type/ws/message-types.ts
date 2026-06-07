export interface ITextMsg {
  content: string
}

export interface IImageMsg {
  fileUrl: string
  width?: number
  height?: number
  size?: number
}

export interface IVideoMsg {
  fileUrl: string
  width?: number
  height?: number
  duration?: number
  thumbnailUrl?: string
  size?: number
}

export interface IFileMsg {
  fileUrl: string
  fileName?: string
  size?: number
  mimeType?: string
}

export interface IEmojiMsg {
  fileUrl: string
  emojiId: string
  packageId: string
  width?: number
  height?: number
}

export interface IAudioFileMsg {
  fileUrl: string
  fileName?: string
  duration?: number
  size?: number
}

export interface IReplyMsg {
  originMsgId: string
  originMsg?: IMessageMsg | null
  replyMsg: IMessageMsg
}

export interface IVoiceMsg {
  fileUrl: string
  duration?: number
  size?: number
}

export interface IMarkdownMsg {
  content: string
}

export interface IMessageMsg {
  type: number
  targetMsgId?: string
  textMsg?: ITextMsg | null
  imageMsg?: IImageMsg | null
  videoMsg?: IVideoMsg | null
  fileMsg?: IFileMsg | null
  voiceMsg?: IVoiceMsg | null
  emojiMsg?: IEmojiMsg | null
  audioFileMsg?: IAudioFileMsg | null
  replyMsg?: IReplyMsg | null
  notificationMsg?: { type: number, actors: string[] } | null
  withdrawMsg?: { originMsgId: string, originMsg?: any } | null
  forwardMsg?: {
    title: string
    recordId: string
    count: number
    msgList?: IMessageMsg[]
  } | null
  markdownMsg?: IMarkdownMsg | null
}

export interface IMessageSender {
  avatar?: string
  nickName?: string
  userId: string
}

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

export interface IPrivateMessageSyncBody extends IPrivateMessageReceiveBody {}

export interface IChatMessageSendBody {
  conversationId: string
  messageId: string
  msg: IMessageMsg
  chatType: 'private' | 'group'
}

/** @deprecated Use IChatMessageSendBody instead */
export type IPrivateMessageSendBody = IChatMessageSendBody

export interface ITableUpdate {
  table: 'messages' | 'conversations' | 'user_conversations'
  conversationId?: string
  userId?: string
  data: Array<{
    seq?: number
    version?: number
  }>
}

export interface ITableUpdatesBody {
  tableUpdates: ITableUpdate[]
}
