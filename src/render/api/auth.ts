import type {
  IEmailLoginReq,
  IEmailLoginRes,
  IEmailPasswordLoginReq,
  IEmailPasswordLoginRes,
  IEmailRegisterReq,
  IEmailRegisterRes,
  IGetEmailCodeReq,
  IGetEmailCodeRes,
  IGetPhoneCodeReq,
  IGetPhoneCodeRes,
  ILogoutReq,
  ILogoutRes,
  IPhoneLoginReq,
  IPhoneLoginRes,
  IPhoneRegisterReq,
  IPhoneRegisterRes,
  IResetPasswordReq,
  IResetPasswordRes,
} from 'commonModule/type/ajax/auth'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 手机号登录
 */
export const phoneLoginApi = (data: IPhoneLoginReq) => {
  return ajax<IPhoneLoginRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/phone_login`,
  })
}

/**
 * @description: 邮箱密码登录
 */
export const emailPasswordLoginApi = (data: IEmailPasswordLoginReq) => {
  return ajax<IEmailPasswordLoginRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/email_password_login`,
  })
}

/**
 * @description: 用户认证
 */
export const authenticationApi = () => {
  return ajax({
    method: 'GET',
    url: `${baseUrl}/api/auth/authentication`,
  })
}

/**
 * @description: 手机号注册
 */
export const phoneRegisterApi = (data: IPhoneRegisterReq) => {
  return ajax<IPhoneRegisterRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/phone_register`,
  })
}

/**
 * @description: 邮箱注册
 */
export const emailRegisterApi = (data: IEmailRegisterReq) => {
  return ajax<IEmailRegisterRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/email_register`,
  })
}

/**
 * @description: 用户登出
 */
export const logoutApi = (data: ILogoutReq) => {
  return ajax<ILogoutRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/logout`,
  })
}

/**
 * @description: 获取手机验证码
 */
export const getPhoneCodeApi = (data: IGetPhoneCodeReq) => {
  return ajax<IGetPhoneCodeRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/phonecode`,
  })
}

/**
 * @description: 获取邮箱验证码
 */
export const getEmailCodeApi = (data: IGetEmailCodeReq) => {
  return ajax<IGetEmailCodeRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/emailcode`,
  })
}

/**
 * @description: 邮箱登录
 */
export const emailLoginApi = (data: IEmailLoginReq) => {
  return ajax<IEmailLoginRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/email_login`,
  })
}

/**
 * @description: 找回密码（通过邮箱验证码重置密码）
 */
export const resetPasswordApi = (data: IResetPasswordReq) => {
  return ajax<IResetPasswordRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/reset_password`,
  })
}
