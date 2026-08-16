import type { IBeaverBridgeResult } from './result'

export interface IBeaverBridgeUserInfo {
  userId: string
  nickName: string
  avatar: string
}

export interface IBeaverBridgeUserModule {
  getUserInfo: () => Promise<IBeaverBridgeResult<IBeaverBridgeUserInfo>>
}
