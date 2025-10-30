import type { IGroupSyncReq, IGroupSyncRes } from 'commonModule/type/ajax/group'
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
