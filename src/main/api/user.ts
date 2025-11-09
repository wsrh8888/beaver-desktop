import type { IUserSyncReq, IUserSyncRes } from 'commonModule/type/ajax/user'
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
