import type { ICircleSyncReq, ICircleSyncRes } from 'commonModule/type/ajax/circle'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

export const circleSyncApi = (data: ICircleSyncReq) => {
  return ajax<ICircleSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/circle/v1/circle/sync`,
  })
}
