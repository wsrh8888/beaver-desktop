// 发起音视频通话请求
export interface IStartCallReq {
  callType: number // 通话类型：1-单聊语音, 2-单聊视频, 3-群聊语音, 4-群聊视频
  targetId: string // 目标ID：单聊为对方ID，群聊为群ID
}

// 发起音视频通话响应
export interface IStartCallRes {
  roomId: string // 房间ID
  roomToken: string // LiveKit令牌
  liveKitUrl: string // LiveKit服务器地址
}

// 获取通话令牌请求
export interface IGetCallTokenReq {
  roomId: string
}

// 获取通话令牌响应
export interface IGetCallTokenRes {
  roomToken: string
  liveKitUrl: string
}

// 挂断/拒绝通话请求
export interface IHangupCallReq {
  roomId: string
}

// 挂断/拒绝通话响应
export interface IHangupCallRes {
  success: boolean
}

// 通话历史记录请求
export interface IGetCallHistoryReq {
  page?: number
  size?: number
}

// 通话历史记录项
export interface ICallHistoryItem {
  roomId: string
  callerId: string
  callType: number
  status: number
  startTime: number
  duration: number
}

// 通话历史记录响应
export interface IGetCallHistoryRes {
  list: ICallHistoryItem[]
}
