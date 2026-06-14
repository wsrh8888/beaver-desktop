import type { IUserSettingsRes, IUserSyncReq, IUserSyncRes } from 'commonModule/type/ajax/user'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 用户数据同步
 */
export const userSyncApi = (data: IUserSyncReq) => {
  return ajax<IUserSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/user/v1/sync`,
  })
}

/**
 * @description: 获取用户设置
 */
export const getUserSettingsApi = () => {
  return ajax<IUserSettingsRes>({
    method: 'GET',
    url: `${getBaseUrl()}/api/user/v1/settings`,
  })
}
