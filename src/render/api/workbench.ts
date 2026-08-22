import type {
  IListWorkbenchAppsReq,
  IListWorkbenchAppsRes,
} from 'commonModule/type/ajax/workbench'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

export const listWorkbenchAppsApi = (data?: IListWorkbenchAppsReq) => {
  return ajax<IListWorkbenchAppsRes>({
    method: 'GET',
    params: data || {},
    url: `${baseUrl}/api/platform/v1/list_workbench`,
  })
}
