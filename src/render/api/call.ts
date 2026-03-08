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
  IAddCallMemberReq,
  IAddCallMemberRes,
  IGetCallParticipantsReq,
  IGetCallParticipantsRes,
  IInviteCallMemberReq,
  IInviteCallMemberRes,
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

/**
 * @description: 群聊中途加入通话
 */
export const addCallMemberApi = (data: IAddCallMemberReq) => {
  return ajax<IAddCallMemberRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/add_member`,
  })
}

/**
 * @description: 获取房间当前成员列表
 */
export const getParticipantsApi = (params: IGetCallParticipantsReq) => {
  return ajax<IGetCallParticipantsRes>({
    method: 'GET',
    params,
    url: `${baseUrl}/api/call/v1/participants`,
  })
}

/**
 * @description: 邀请成员加入通话
 */
export const inviteCallMemberApi = (data: IInviteCallMemberReq) => {
  return ajax<IInviteCallMemberRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/invite`,
  })
}
