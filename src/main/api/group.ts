import type {
  IGetUserGroupVersionsRes,
  IGroupJoinRequestSyncReq,
  IGroupJoinRequestSyncRes,
  IGroupMemberSyncReq,
  IGroupMemberSyncRes,
  IGroupSearchReq,
  IGroupSearchRes,
  IGroupSyncReq,
  IGroupSyncRes,
} from 'commonModule/type/ajax/group'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 获取用户群组版本信息
 */
export const getUserGroupVersionsApi = () => {
  return ajax<IGetUserGroupVersionsRes>({
    method: 'GET',
    url: `${getBaseUrl()}/api/group/v1/versions`,
  })
}

/**
 * @description: 群组数据同步
 */
export const groupSyncApi = (data: IGroupSyncReq) => {
  return ajax<IGroupSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/sync`,
  })
}

/**
 * @description: 群成员数据同步
 */
export const groupMemberSyncApi = (data: IGroupMemberSyncReq) => {
  return ajax<IGroupMemberSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/member_sync`,
  })
}

/**
 * @description: 群组申请数据同步
 */
export const groupJoinRequestSyncApi = (data: IGroupJoinRequestSyncReq) => {
  return ajax<IGroupJoinRequestSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/join_request_sync`,
  })
}

/**
 * @description: 搜索群组
 */
export const searchGroupsApi = (data: IGroupSearchReq) => {
  return ajax<IGroupSearchRes>({
    method: 'GET',
    params: data,
    url: `${getBaseUrl()}/api/group/v1/search`,
  })
}
