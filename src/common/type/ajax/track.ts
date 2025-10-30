// 事件类型枚举
export enum EventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  API_CALL = 'api_call',
  ERROR = 'error',
  USER_ACTION = 'user_action',
}

// 事件数据
export interface IEventData {
  eventName: string // 事件名称，如 EVENT_REGISTER
  action: string // 操作类型，如 click, view
  bucketId: string // Bucket Id
  platform?: string // 平台，如 ios, android, web
  timestamp: number // 事件时间戳(毫秒)
  deviceID?: string // 设备ID(可选)
  data?: string // 额外数据(JSON格式)
}

// 上报统计埋点事件请求
export interface IReportEventsReq {
  userId?: string // 用户ID(可选)
  events?: IEventData[] // 事件列表(可选)
}

// 上报统计埋点事件响应
export interface IReportEventsRes {
  message: string
}

// 日志数据
export interface ILogData {
  level: string // 日志级别：debug, info, warn, error
  bucketId: string // Bucket Id
  data: string // 日志数据(JSON格式)
  timestamp?: number // 日志时间戳(毫秒)，可选
}

// 记录日志请求
export interface ILogEventsReq {
  logs: ILogData[] // 日志列表
}

// 记录日志响应
export interface ILogEventsRes {
  message: string
}
