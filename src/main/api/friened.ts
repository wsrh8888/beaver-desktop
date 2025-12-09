import type {
  IFriendSyncReq,
  IFriendSyncRes,
  IFriendUserVersionsReq,
  IFriendUserVersionsRes,
  IFriendVerifySyncReq,
  IFriendVerifySyncRes,
  IGetFriendsListByIdsReq,
  IGetFriendsListByIdsRes,
  IGetFriendVerifiesListByIdsReq,
  IGetFriendVerifiesListByIdsRes,
} from 'commonModule/type/ajax/friend'
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

/**
 * @description: 获取好友用户版本信息（用于数据同步）
 */
export const friendUserVersionsApi = (data: IFriendUserVersionsReq) => {
  return ajax<IFriendUserVersionsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/friend-user-versions`,
  })
}

/**
 * @description: 批量获取好友数据
 */
export const getFriendsListByIdsApi = (data: IGetFriendsListByIdsReq) => {
  return ajax<IGetFriendsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/getFriendsListByIds`,
  })
}

/**
 * @description: 批量获取好友验证数据
 */
export const getFriendVerifiesListByIdsApi = (data: IGetFriendVerifiesListByIdsReq) => {
  return ajax<IGetFriendVerifiesListByIdsRes>({
    method: 'POST',
    data: {
      ids: data.verifyIds, // 接口字段名为 ids
    },
    url: `${getBaseUrl()}/api/friend/getFriendVerifiesListByIds`,
  })
}
