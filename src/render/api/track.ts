import type {
  ILogEventsReq,
  ILogEventsRes,
  IReportEventsReq,
  IReportEventsRes,
} from 'commonModule/type/ajax/track'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 上报统计埋点事件
 */
export const reportEventsApi = (data: IReportEventsReq) => {
  return ajax<IReportEventsRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/platform/track_public/v1/report_events`,
  })
}

/**
 * @description: 记录日志
 */
export const logEventsApi = (data: ILogEventsReq) => {
  return ajax<ILogEventsRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/platform/track_public/v1/log_events`,
  })
}
