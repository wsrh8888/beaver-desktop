import type { IFriendSyncReq, IFriendSyncRes, IFriendVerifySyncReq, IFriendVerifySyncRes } from 'commonModule/type/ajax/friend'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 好友数据同步
 */
export const friendSyncApi = (data: IFriendSyncReq) => {
  return ajax<IFriendSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/sync`,
  })
}

/**
 * @description: 好友验证数据同步
 */
export const friendVerifySyncApi = (data: IFriendVerifySyncReq) => {
  return ajax<IFriendVerifySyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/verifySync`,
  })
}
