import { baseUrl } from "commonModule/config"
import { ajax } from "commonModule/utils/axios/request"

/**
 * @description: 鉴权
 */
export const getAuthenticationApi = () => {
  return ajax({
    method: 'GET',
    url: `${baseUrl}/api/auth/authentication`
  })
}