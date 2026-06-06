import type {
  IGetFriendsListByIdsReq,
  IGetFriendsListByIdsRes,
  IGetFriendVerifiesListByIdsReq,
  IGetFriendVerifiesListByIdsRes,
} from 'commonModule/type/ajax/friend'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 批量获取好友数据
 */
export const getFriendsListByIdsApi = (data: IGetFriendsListByIdsReq) => {
  return ajax<IGetFriendsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/v1/getFriendsListByIds`,
  })
}

/**
 * @description: 批量获取好友验证数据
 */
export const getFriendVerifiesListByIdsApi = (data: IGetFriendVerifiesListByIdsReq) => {
  return ajax<IGetFriendVerifiesListByIdsRes>({
    method: 'POST',
    data: {
      verifyIds: data.verifyIds,
    },
    url: `${getBaseUrl()}/api/friend/v1/getFriendVerifiesListByIds`,
  })
}
