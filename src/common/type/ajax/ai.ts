// AI消息类型枚举
export enum AIMessageType {
  TEXT = 1,
  IMAGE = 2,
  VOICE = 3,
  FILE = 4,
}

// AI角色枚举
export enum AIRole {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}

// AI消息
export interface IAIMessage {
  role: string // 角色：user/assistant/system
  content: string // 消息内容
  type?: string // 消息类型：text/image
}

// AI聊天请求
export interface IChatWithAIReq {
  botId: number // 机器人ID
  messages: IAIMessage[] // 聊天历史
  maxTokens?: number // 最大token数
  temperature?: number // 温度参数
  messageType: string // 消息类型：text/image
  newTopic?: boolean // 是否开启新话题
}

// AI聊天响应（SSE格式）
export interface IChatWithAIRes {
  event: string // 事件类型：message/error/done
  messageId: string // 消息ID
  content: string // 消息内容
  type?: string // 消息类型：text/image
  error?: string // 错误信息
}

// AI机器人信息
export interface IAIBotInfo {
  botId: number // 机器人ID
  name: string // 机器人名称
  fileName: string // 机器人头像
  description: string // 机器人描述
  provider: string // 提供商(如deepseek, doubao等)
  isOnline: boolean // 是否在线
  features: string[] // 支持的功能列表，如["chat", "image"]
}

// 获取AI机器人列表请求
export interface IGetAIBotsReq {
  page?: number // 页码，可选，默认1
  limit?: number // 每页数量，可选，默认20
}

// 获取AI机器人列表响应
export interface IGetAIBotsRes {
  total: number
  bots: IAIBotInfo[]
}
