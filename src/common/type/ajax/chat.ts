// 消息类型枚举
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
  VOICE = 5, // 语音消息（移动端录制的短语音）
  EMOJI = 6, // 表情消息
  NOTIFICATION = 7, // 通知消息（会话内的通知，如：xxx加入了群聊、xxx创建了群等）
  AUDIO_FILE = 8, // 音频文件消息（用户上传的音频文件）
}

// 消息发送状态
export enum MessageStatus {
  SENDING = 0, // 发送中
  SENT = 1, // 已发送（本地发送成功）
  FAILED = 2, // 发送失败
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
  fileName: string // 图片文件ID
  width?: number // 图片宽度（可选）
  height?: number // 图片高度（可选）
  size?: number // 文件大小（字节，可选）
}

export interface IMessage {
  type: MessageType
  textMsg?: ITextMessage
  imageMsg?: IImageMessage | null
  videoMsg?: IVideoMessage | null
  fileMsg?: IFileMessage | null
  voiceMsg?: IVoiceMessage | null
  emojiMsg?: IEmojiMessage | null
  notificationMsg?: INotificationMessage | null
  audioFileMsg?: IAudioFileMessage | null
  replyMsg?: IReplyMessage | null
}

// 视频消息
export interface IVideoMessage {
  fileName: string // 视频文件ID
  width?: number // 视频宽度（可选）
  height?: number // 视频高度（可选）
  duration?: number // 视频时长（秒，可选）
  thumbnailKey?: string // 视频封面图文件ID（可选）
  size?: number // 文件大小（字节，可选）
}

// 文件消息
export interface IFileMessage {
  fileName: string // 文件ID
  fileKey?: string // 文件ID（兼容字段）
  size?: number // 文件大小（字节，可选）
  mimeType?: string // MIME类型（可选，如 application/pdf）
}

// 语音消息（移动端录制的短语音）
export interface IVoiceMessage {
  fileName: string // 语音文件ID
  duration?: number // 语音时长（秒，可选）
  size?: number // 文件大小（字节，可选）
}

// 音频文件消息（用户上传的音频文件）
export interface IAudioFileMessage {
  fileName: string // 音频文件ID
  fileKey?: string // 文件ID（兼容字段）
  duration?: number // 音频时长（秒，可选）
  size?: number // 文件大小（字节，可选）
}

// 表情消息
export interface IEmojiMessage {
  fileName: string // 表情图片文件ID
  emojiId: number // 表情ID
  packageId: number // 表情包ID
}

// 通知消息（会话内的通知，如：xxx加入了群聊、xxx创建了群等）
export interface INotificationMessage {
  type: number // 通知类型：1=好友欢迎 2=创建群 3=加入群 4=退出群 5=踢出成员 6=转让群主等
  actors: string[] // 相关用户ID列表
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
  /**
   * @description: 头像
   */
  avatar: string
  /**
   * @description: 昵称
   */
  nickname: string
  /**
   * @description: 消息预览
   */
  msgPreview: string
  /**
   * @description: 消息时间（格式化后的字符串，前端计算属性，可选）
   */
  updateAt?: string
  /**
   * @description: 消息时间戳（原始时间戳，秒级，用于排序和格式化）
   */
  updatedAt: number
  /**
   * @description: 是否置顶
   */
  isTop: boolean
  /**
   * @description: 会话ID
   */
  conversationId: string
  /**
   * @description: 会话类型
   */
  chatType: number
  /**
   * @description: 备注
   */
  notice: string
  /**
   * @description: 会话配置版本号
   */
  version: number
  /**
   * @description: 未读消息数量
   */
  unreadCount: number
  /**
   * @description: 是否免打扰
   */
  isMuted: boolean
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
  seq?: number // 可选，消息序列号，用于分页加载（加载比这个seq更小的消息）
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
  sendStatus?: MessageStatus // 发送状态（本地发送状态）
}

// 聊天数据同步请求
export interface IChatSyncReq {
  conversationId: string // 会话ID，可选，不传则同步所有会话
  fromSeq: number // 起始序列号
  toSeq: number // 结束序列号
  limit?: number // 限制数量，默认100
}

// 聊天同步消息类型
export interface IChatSyncMessage {
  messageId: string // 客户端消息ID
  conversationId: string // 会话ID
  conversationType: number // 会话类型（1=私聊 2=群聊）
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

// 批量获取会话数据请求
export interface IGetConversationsListByIdsReq {
  conversationIds: string[] // 会话ID列表
}

// 批量获取会话数据响应
export interface IGetConversationsListByIdsRes {
  conversations: IConversationById[] // 会话列表
}

// 会话数据项（按ID批量获取）
export interface IConversationById {
  conversationId: string // 会话ID
  type: number // 会话类型 1=私聊 2=群聊 3=系统会话
  maxSeq: number // 会话消息的最大Seq
  lastMessage: string // 会话最后一条消息预览
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 批量获取用户会话设置数据请求
export interface IGetUserConversationSettingsListByIdsReq {
  conversationIds: string[] // 会话ID列表
}

// 批量获取用户会话设置数据响应
export interface IGetUserConversationSettingsListByIdsRes {
  userConversationSettings: IUserConversationSettingById[] // 用户会话设置列表
}

// 用户会话设置项（按ID批量获取）
export interface IUserConversationSettingById {
  userId: string // 用户ID
  conversationId: string // 会话ID
  isHidden: boolean // 是否隐藏
  isPinned: boolean // 是否置顶
  isMuted: boolean // 是否免打扰
  userReadSeq: number // 用户已读序列号
  version: number // 版本号
  createAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

// 更新已读序列号请求
export interface IUpdateReadSeqReq {
  conversationId: string // 会话ID
  readSeq: number // 已读序列号（用户已读到的消息seq）
}

// 更新已读序列号响应
export interface IUpdateReadSeqRes {
  success: boolean // 是否成功
}