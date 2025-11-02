// 消息类型枚举
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
  VOICE = 5,
  VOICE_CALL = 6,
  VIDEO_CALL = 7,
  WITHDRAW = 8,
  REPLY = 9,
  QUOTE = 10,
  AT = 11,
  TIP = 12,
}

// 消息发送状态
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

export interface IRecentChatReq {
  page?: number
  limit?: number
}

// 最近聊天列表响应
export interface IRecentChatRes {
  count: number
  list: IConversationInfoRes[]
}

export interface ITextMessage {
  content: string
}

export interface IImageMessage {
  fileName: string
  width?: number
  height?: number
  size?: number
}

export interface IMessage {
  type: MessageType
  textMsg?: ITextMessage
  imageMsg?: IImageMessage | null
  videoMsg?: IVideoMessage | null
  fileMsg?: IFileMessage | null
  voiceMsg?: IVoiceMessage | null
  emojiMsg?: IEmojiMessage | null
  replyMsg?: IReplyMessage | null
}

// 视频消息
export interface IVideoMessage {
  fileName: string // 视频文件ID
}

// 文件消息
export interface IFileMessage {
  fileName: string // 文件ID
}

// 语音消息
export interface IVoiceMessage {
  fileName: string // 语音文件ID
}

// 表情消息
export interface IEmojiMessage {
  fileName: string // 表情图片文件ID
  emojiId: number // 表情ID
  packageId: number // 表情包ID
}

// 回复消息
export interface IReplyMessage {
  replyToMessageId: string // 被回复的消息ID
  replyToContent: string // 被回复的消息内容预览
  replyToSender: string // 被回复消息的发送者昵称
}

// 发送消息请求
export interface ISendMsgReq {
  conversationId: string // 会话ID
  messageId: string // 客户端消息ID
  msg: IMessage
}

// 发送消息响应
export interface ISendMsgRes {
  id: number // 数据库自增ID
  messageId: string // 客户端消息ID
  conversationId: string // 会话ID
  msg: IMessage
  sender: ISender // 发送者
  createAt: string // 消息时间
  msgPreview: string // 消息预览
  status: number // 消息状态 1:正常 2:已撤回 3:已编辑
}

// 发送者信息
export interface ISender {
  userId: string
  avatar: string
  nickname: string
}

// 会话信息请求
export interface IConversationInfoReq {
  conversationId: string // 会话ID
}

// 会话信息响应
export interface IConversationInfoRes {
  avatar: string // 头像
  nickname: string // 昵称
  msg_preview: string // 消息预览
  update_at: string // 消息时间
  is_top: boolean // 是否置顶
  conversationId: string // 会话ID
  chatType: number // 会话类型 1:好友 2:群聊 3:AI机器人
  notice: string // 备注
  version: number // 会话配置版本号
}

// 最近聊天列表请求
export interface IRecentChatListReq {
  page?: number
  limit?: number
}

// 创建会话请求
export interface ICreateConversationReq {
  targetId: string // 目标用户ID或群组ID
  type: number // 会话类型 1:好友 2:群聊 3:AI机器人
}

// 聊天历史请求
export interface IChatHistoryReq {
  conversationId: string // 会话ID
  page?: number
  limit?: number
}

// 聊天历史响应
export interface IChatHistoryRes {
  count: number
  list: IChatHistory[]
}

// 删除最近会话请求
export interface IDeleteRecentReq {
  conversationId: string // 会话ID
}

// 删除最近会话响应
export interface IDeleteRecentRes {
  message: string
}

// 聊天消息按版本范围查询请求
export interface IChatMessageVerRangeReq {
  startSeq: number
  endSeq: number
  conversationId?: string
}

// 聊天消息按版本范围查询响应
export interface IChatMessageVerRangeRes {
  list: IChatHistory[]
}

// 会话设置按版本范围查询请求
export interface IChatConversationVerRangeReq {
  startVersion: number
  endVersion: number
}

// 会话设置按版本范围查询响应
export interface IChatConversationVerRangeRes {
  list: IConversationInfoRes[]
}

// 会话数据按版本范围查询请求
export interface IChatDatasyncVerRangeReq {
  startVersion: number
  endVersion: number
}

// 会话数据按版本范围查询响应
export interface IChatDatasyncVerRangeRes {
  list: any[] // TODO: 定义具体的会话数据结构
}

// 置顶会话请求
export interface IPinnedChatReq {
  conversationId: string // 会话ID
  isPinned: boolean // true表示置顶 false表示不置顶
}

// 置顶会话响应
export interface IPinnedChatRes {
  message: string
}

// 编辑消息请求
export interface IEditMessageReq {
  messageId: string // 客户端消息ID
  content: string // 新的消息内容
}

// 编辑消息响应
export interface IEditMessageRes {
  id: number // 数据库自增ID
  messageId: string // 客户端消息ID
  content: string // 编辑后的内容
  editTime: string // 编辑时间
}

// 撤回消息请求
export interface IRecallMessageReq {
  messageId: string // 客户端消息ID
}

// 撤回消息响应
export interface IRecallMessageRes {
  id: number // 数据库自增ID
  messageId: string // 客户端消息ID
  recallTime: string // 撤回时间
}

// 转发消息请求
export interface IForwardMessageReq {
  messageId: string // 客户端消息ID
  targetId: string // 目标会话ID
  forwardType: number // 1: 单聊 2: 群聊
}

// 转发消息响应
export interface IForwardMessageRes {
  id: number // 数据库自增ID
  messageId: string // 客户端消息ID
  forwardTime: string
}

// 聊天历史消息类型（数据库记录）
export interface IChatHistory {
  id: number // 数据库自增ID
  messageId: string // 客户端消息ID
  conversationId: string // 会话ID
  seq: number // 消息序列号
  msg: IMessage // 消息内容对象
  sender: ISender // 发送者信息
  create_at: string // 创建时间
  status: number // 消息状态
}

// 聊天数据同步请求
export interface IChatSyncReq {
  conversationId?: string // 会话ID，可选，不传则同步所有会话
  fromSeq: number // 起始序列号
  toSeq: number // 结束序列号
  limit?: number // 限制数量，默认100
}

// 聊天同步消息类型
export interface IChatSyncMessage {
  messageId: string // 客户端消息ID
  conversationId: string // 会话ID
  sendUserId: string // 发送者用户ID
  msgType: number // 消息类型
  msgPreview: string // 消息预览
  msg: string // 消息内容JSON字符串
  isDeleted: boolean // 是否已删除
  seq: number // 序列号，用于数据同步
  createAt: number // 创建时间戳
}

// 聊天数据同步响应
export interface IChatSyncRes {
  messages: IChatSyncMessage[] // 消息列表
  hasMore: boolean // 是否还有更多数据
  nextSeq: number // 下次同步的起始序列号
}

// 会话数据同步请求
export interface IConversationSyncReq {
  fromVersion: number // 起始版本号
  toVersion: number // 结束版本号
  limit?: number // 限制数量，默认100
}

// 会话同步项
export interface IConversationSyncItem {
  conversationId: string // 会话ID
  type: number // 会话类型 1=私聊 2=群聊 3=系统会话
  maxSeq: number // 会话消息的最大Seq
  lastMessage: string // 会话最后一条消息预览
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 会话数据同步响应
export interface IConversationSyncRes {
  conversations: IConversationSyncItem[] // 会话列表
  hasMore: boolean // 是否还有更多数据
  nextVersion: number // 下次同步的起始版本号
}

// 用户会话关系数据同步请求
export interface IUserConversationSyncReq {
  fromVersion: number // 起始版本号
  toVersion: number // 结束版本号
  limit?: number // 限制数量，默认100
}

// 用户会话关系同步项
export interface IUserConversationSyncItem {
  userId: string // 用户ID
  conversationId: string // 会话ID
  lastMessage: string // 最后一条消息内容
  isDeleted: boolean // 是否已删除
  isPinned: boolean // 是否置顶
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 用户会话关系数据同步响应
export interface IUserConversationSyncRes {
  userConversations: IUserConversationSyncItem[] // 用户会话关系列表
  hasMore: boolean // 是否还有更多数据
  nextVersion: number // 下次同步的起始版本号
}
