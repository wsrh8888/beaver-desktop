import type {
  ICallHistoryItem,
  IGetCallHistoryReq,
  IGetCallHistoryRes,
  IGetCallTokenReq,
  IGetCallTokenRes,
  IHangupCallReq,
  IHangupCallRes,
  IStartCallReq,
  IStartCallRes,
} from 'commonModule/type/ajax/call'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 发起音视频通话
 */
export const startCallApi = (data: IStartCallReq) => {
  return ajax<IStartCallRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/start`,
  })
}

/**
 * @description: 接听通话并获取令牌
 */
export const getCallTokenApi = (data: IGetCallTokenReq) => {
  return ajax<IGetCallTokenRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/token`,
  })
}

/**
 * @description: 主动挂断或拒绝通话
 */
export const hangupCallApi = (data: IHangupCallReq) => {
  return ajax<IHangupCallRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/hangup`,
  })
}

/**
 * @description: 查询通话历史
 */
export const getCallHistoryApi = (params: IGetCallHistoryReq) => {
  return ajax<IGetCallHistoryRes>({
    method: 'GET',
    params,
    url: `${baseUrl}/api/call/v1/history`,
  })
}
