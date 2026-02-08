export interface IParticipant {
  userId: string
  status: 'calling' | 'joined' | 'left' | 'rejected' | 'busy'
}

// 发起音视频通话请求
export interface IStartCallReq {
  callType: number // 通话类型：1-私聊, 2-群聊
  callMode: number // 1-语音, 2-视频
  targetId: string // 目标ID：单聊为对方ID，群聊为群ID
}

// 发起音视频通话响应
export interface IStartCallRes {
  roomId: string // 房间ID
  roomToken: string // LiveKit令牌
  liveKitUrl: string // LiveKit服务器地址
  participants: IParticipant[] // 初始参与者快照
}

// 获取通话令牌请求
export interface IGetCallTokenReq {
  roomId: string
}

// 获取通话令牌响应
export interface IGetCallTokenRes {
  roomToken: string
  liveKitUrl: string
  participants: IParticipant[] // 当前所有成员快照
}

// 挂断/拒绝通话请求
export interface IHangupCallReq {
  roomId: string
}

// 挂断/拒绝通话响应
export interface IHangupCallRes { }

// 新增成员请求
export interface IAddCallMemberReq {
  roomId: string
}

// 新增成员响应
export interface IAddCallMemberRes {
  roomToken: string
  liveKitUrl: string
}

// 获取房间成员清单请求
export interface IGetCallParticipantsReq {
  roomId: string
}

// 获取房间成员清单响应
export interface IGetCallParticipantsRes {
  participants: IParticipant[]
}

export interface IInviteCallMemberReq {
  roomId: string;
  targetIds: string[];
}

export interface IInviteCallMemberRes { }

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
