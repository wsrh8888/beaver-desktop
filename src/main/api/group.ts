import type {
  IGroupJoinRequestSyncReq,
  IGroupJoinRequestSyncRes,
  IGroupMemberSyncReq,
  IGroupMemberSyncRes,
  IGroupSyncReq,
  IGroupSyncRes,
} from 'commonModule/type/ajax/group'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 群组数据同步
 */
export const groupSyncApi = (data: IGroupSyncReq) => {
  return ajax<IGroupSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/sync`,
  })
}

/**
 * @description: 群成员数据同步
 */
export const groupMemberSyncApi = (data: IGroupMemberSyncReq) => {
  return ajax<IGroupMemberSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/member-sync`,
  })
}

/**
 * @description: 群组申请数据同步
 */
export const groupJoinRequestSyncApi = (data: IGroupJoinRequestSyncReq) => {
  return ajax<IGroupJoinRequestSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/join-request-sync`,
  })
}
