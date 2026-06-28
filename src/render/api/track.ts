import type { ILogEventsReq } from 'commonModule/type/ajax/track'
import ajax from 'renderModule/utils/request/ajax'
import { baseUrl } from 'commonModule/config'

export const logEventsApi = (data: ILogEventsReq) => {
  return ajax({
    method: 'POST',
    url: `${baseUrl}/api/platform/track_public/v1/log`,
    data,
  })
}
