// 日志数据
export interface ILogData {
  level: string
  bucketId: string
  data: string
  timestamp?: number
}

export interface ILogEventsReq {
  logs: ILogData[]
}

export interface ILogEventsRes {
  message: string
}
