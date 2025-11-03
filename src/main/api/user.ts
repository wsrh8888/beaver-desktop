import type { IUserSyncByIdsReq, IUserSyncByIdsRes, IUserSyncReq, IUserSyncRes } from 'commonModule/type/ajax/user'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 用户数据同步
 */
export const userSyncApi = (data: IUserSyncReq) => {
  return ajax<IUserSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/user/sync`,
  })
}

/**
 * @description: 用户数据同步（通过用户ID列表，大厂方式）
 */
export const userSyncByIdsApi = (data: IUserSyncByIdsReq) => {
  return ajax<IUserSyncByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/user/sync-by-ids`,
  })
}
