import type {
  IUpdateEmailReq,
  IUpdateEmailRes,
  IUpdateInfoReq,
  IUpdateInfoRes,
  IUpdatePasswordReq,
  IUpdatePasswordRes,
  IUserInfoRes,
} from 'commonModule/type/ajax/user'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 获取用户信息
 */
export const getUserInfoApi = () => {
  return ajax<IUserInfoRes>({
    method: 'GET',
    url: `${baseUrl}/api/user/user_info`,
  })
}
/**
 * @description: 修改用户信息
 */
export const updateInfoApi = (data: IUpdateInfoReq) => {
  return ajax<IUpdateInfoRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/update_info`,
  })
}

/**
 * @description: 修改密码
 */
export const updatePasswordApi = (data: IUpdatePasswordReq) => {
  return ajax<IUpdatePasswordRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/update_password`,
  })
}

/**
 * @description: 修改邮箱
 */
export const updateEmailApi = (data: IUpdateEmailReq) => {
  return ajax<IUpdateEmailRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/update_email`,
  })
}
