import type {
  IUpdateEmailReq,
  IUpdateEmailRes,
  IUpdateInfoReq,
  IUpdateInfoRes,
  IUpdateUserSettingsReq,
  IUpdateUserSettingsRes,
  IUserInfoRes,
  IUserSettingsRes,
} from 'commonModule/type/ajax/user'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 获取用户信息
 */
export const getUserInfoApi = () => {
  return ajax<IUserInfoRes>({
    method: 'GET',
    url: `${baseUrl}/api/user/v1/user_info`,
  })
}
/**
 * @description: 修改用户信息
 */
export const updateInfoApi = (data: IUpdateInfoReq) => {
  return ajax<IUpdateInfoRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/v1/update_info`,
  })
}

/**
 * @description: 修改邮箱
 */
export const updateEmailApi = (data: IUpdateEmailReq) => {
  return ajax<IUpdateEmailRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/v1/update_email`,
  })
}

/**
 * @description: 获取用户设置
 */
export const getUserSettingsApi = () => {
  return ajax<IUserSettingsRes>({
    method: 'GET',
    url: `${baseUrl}/api/user/v1/settings`,
  })
}

/**
 * @description: 更新用户设置
 */
export const updateUserSettingsApi = (data: IUpdateUserSettingsReq) => {
  return ajax<IUpdateUserSettingsRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/v1/update_settings`,
  })
}
