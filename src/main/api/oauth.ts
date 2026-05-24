import type { IGetH5AuthCodeReq, IGetH5AuthCodeRes } from 'commonModule/type/ajax/oauth'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: H5 免登获取 authCode
 */
export const getH5AuthCodeApi = (data: IGetH5AuthCodeReq) => {
  return ajax<IGetH5AuthCodeRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/open/v1/oauth/h5_authcode`,
  })
}
