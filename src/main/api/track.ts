import type { ILogEventsReq } from 'commonModule/type/ajax/track'
import axios from 'axios'
import { getBaseUrl } from 'commonModule/config'

/**
 * @description: 记录客户端日志（独立 axios，避免走 ajax 日志链路造成递归）
 */
export const logEventsApi = (data: ILogEventsReq) => {
  return axios(
    {
      method: 'POST',
      url: `${getBaseUrl()}/api/platform/track_public/v1/log`,
      data,
    },
  ).then(res => res.data)
}
