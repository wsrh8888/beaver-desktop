import type {
  IGetLatestVersionReq,
  IGetLatestVersionRes,
  IReportVersionReq,
  IReportVersionRes,
} from 'commonModule/type/ajax/update'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 上报版本信息
 */
export const reportVersionApi = (data: IReportVersionReq) => {
  return ajax<IReportVersionRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/update/report`,
  })
}

/**
 * @description: 获取最新版本
 */
export const getLatestVersionApi = (data: IGetLatestVersionReq) => {
  return ajax<IGetLatestVersionRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/update/latest`,
  })
}
