import type {
  IEmailLoginReq,
  IEmailLoginRes,
  IEmailPasswordLoginReq,
  IEmailPasswordLoginRes,
  IOAuthCodeLoginReq,
  IOAuthCodeLoginRes,
  IEmailRegisterReq,
  IEmailRegisterRes,
  IGetDevicesRes,
  IGetEmailCodeReq,
  IGetEmailCodeRes,
  IGetPhoneCodeReq,
  IGetPhoneCodeRes,
  IKickDeviceReq,
  IKickDeviceRes,
  ILogoutReq,
  ILogoutRes,
  IPhoneLoginReq,
  IPhoneLoginRes,
  IPhoneRegisterReq,
  IPhoneRegisterRes,
  IResetPasswordReq,
  IResetPasswordRes,
  IUpdatePasswordReq,
  IUpdatePasswordRes,
} from 'commonModule/type/ajax/auth'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

const AUTH_PUBLIC = `${baseUrl}/api/auth/auth_public/v1`
const AUTH = `${baseUrl}/api/auth/auth/v1`

/**
 * @description: 手机号登录
 */
export const phoneLoginApi = (data: IPhoneLoginReq) => {
  return ajax<IPhoneLoginRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/phone_login`,
  })
}

/**
 * @description: 邮箱密码登录
 */
export const emailPasswordLoginApi = (data: IEmailPasswordLoginReq) => {
  return ajax<IEmailPasswordLoginRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/email_password_login`,
  })
}

/**
 * @description: OAuth 授权码登录（SDK 登录成功后换取 IM Token）
 */
export const oauthCodeLoginApi = (data: IOAuthCodeLoginReq) => {
  return ajax<IOAuthCodeLoginRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/oauth_code_login`,
  })
}

/**
 * @description: 用户认证
 */
export const authenticationApi = () => {
  return ajax({
    method: 'GET',
    url: `${AUTH_PUBLIC}/authentication`,
  })
}

/**
 * @description: 手机号注册
 */
export const phoneRegisterApi = (data: IPhoneRegisterReq) => {
  return ajax<IPhoneRegisterRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/phone_register`,
  })
}

/**
 * @description: 邮箱注册
 */
export const emailRegisterApi = (data: IEmailRegisterReq) => {
  return ajax<IEmailRegisterRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/email_register`,
  })
}

/**
 * @description: 用户登出
 */
export const logoutApi = (data: ILogoutReq) => {
  return ajax<ILogoutRes>({
    method: 'POST',
    data,
    url: `${AUTH}/logout`,
  })
}

/**
 * @description: 获取手机验证码
 */
export const getPhoneCodeApi = (data: IGetPhoneCodeReq) => {
  return ajax<IGetPhoneCodeRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/phonecode`,
  })
}

/**
 * @description: 获取邮箱验证码
 */
export const getEmailCodeApi = (data: IGetEmailCodeReq) => {
  return ajax<IGetEmailCodeRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/emailcode`,
  })
}

/**
 * @description: 邮箱登录
 */
export const emailLoginApi = (data: IEmailLoginReq) => {
  return ajax<IEmailLoginRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/email_login`,
  })
}

/**
 * @description: 找回密码（通过邮箱验证码重置密码）
 */
export const resetPasswordApi = (data: IResetPasswordReq) => {
  return ajax<IResetPasswordRes>({
    method: 'POST',
    data,
    url: `${AUTH_PUBLIC}/reset_password`,
  })
}

/**
 * @description: 修改密码
 */
export const updatePasswordApi = (data: IUpdatePasswordReq) => {
  return ajax<IUpdatePasswordRes>({
    method: 'POST',
    data,
    url: `${AUTH}/update_password`,
  })
}

/**
 * @description: 获取登录设备列表
 */
export const getDevicesApi = () => {
  return ajax<IGetDevicesRes>({
    method: 'GET',
    url: `${AUTH}/devices`,
  })
}

/**
 * @description: 踢下线指定设备
 */
export const kickDeviceApi = (data: IKickDeviceReq) => {
  return ajax<IKickDeviceRes>({
    method: 'POST',
    data,
    url: `${AUTH}/kick_device`,
  })
}
