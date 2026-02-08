export enum CallActionType {
  // 挂断
  HANGUP = 'hangup',
  // 接听（用于在其他端接听了，同步状态?）
  ACCEPT = 'accept',
  // 拒绝
  REJECT = 'reject',
  // 麦克风操作
  MUTE = 'mute',
  // 摄像头操作
  CAMERA = 'camera',
}

export interface CallUpdateData {
  action: CallActionType
  // 具体的 payload
  payload?: any
}
