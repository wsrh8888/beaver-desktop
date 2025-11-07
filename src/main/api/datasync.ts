import type {
  IGetSyncAllGroupsReq,
  IGetSyncAllGroupsRes,
  IGetSyncAllUsersReq,
  IGetSyncAllUsersRes,
  IGetSyncCursorReq,
  IGetSyncCursorRes,
  IUpdateSyncCursorReq,
  IUpdateSyncCursorRes,
} from 'commonModule/type/ajax/datasync'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 获取同步游标
 */
export const getSyncCursorApi = (params: IGetSyncCursorReq) => {
  return ajax<IGetSyncCursorRes>({
    method: 'GET',
    params,
    url: `${getBaseUrl()}/api/datasync/cursor`,
  })
}

/**
 * @description: 更新同步游标
 */
export const updateSyncCursorApi = (data: IUpdateSyncCursorReq) => {
  return ajax<IUpdateSyncCursorRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/cursor`,
  })
}

/**
 * @description: 获取所有需要更新的用户版本信息
 */
export const datasyncGetSyncAllUsersApi = (data: IGetSyncAllUsersReq) => {
  return ajax<IGetSyncAllUsersRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncAllUsers`,
  })
}

/**
 * @description: 获取所有需要更新的群组版本信息
 */
export const datasyncGetSyncAllGroupsApi = (data: IGetSyncAllGroupsReq) => {
  return ajax<IGetSyncAllGroupsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncAllGroups`,
  })
}
