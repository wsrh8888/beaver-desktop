import { baseUrl } from 'commonModule/config'
import { ILoginReq, ILoginRes, IUpdateInfoReq } from 'commonModule/type/ajax/login'
import { IRegisterReq, IUserInfoRes } from 'commonModule/type/ajax/user'
import { ajax } from 'commonModule/utils/axios/request'

/**
 * @description:  获取用户信息
 */
export const getUserInfoApi = () => {
  return ajax<IUserInfoRes>({
    method: 'GET',
    url: `${baseUrl}/api/user/user_info`
  })
}


/**
 * @description:  注册用户
 */
export const registerApi = (data: IRegisterReq) => {
  return ajax({
    method: 'POST',
    data,
    url: `${baseUrl}/api/auth/register`
  })
}



/**
 * @description: 登录
 */
export const loginApi = (data: ILoginReq) => {
  return ajax<ILoginRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/auth/login`
  })
}
/**
 * @description: 修改用户信息
 */
export const updateInfoApi = (data: IUpdateInfoReq) => {
  return ajax({
    data,
    method: 'POST',
    url: `${baseUrl}/api/user/update_info`
  })
}