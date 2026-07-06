import type {
  IListWorkbenchAppsReq,
  IListWorkbenchAppsRes,
} from 'commonModule/type/ajax/workbench'
// import { baseUrl } from 'commonModule/config'
// import ajax from 'renderModule/utils/request/ajax'

export const listWorkbenchAppsApi = (data?: IListWorkbenchAppsReq) => {
  // return ajax<IListWorkbenchAppsRes>({
  //   method: 'GET',
  //   params: data || {},
  //   url: `${baseUrl}/api/platform/v1/list_workbench`,
  // })
  void data
  return Promise.resolve({
    code: 0,
    msg: 'ok',
    result: {
      list: [
        {
          workbenchAppId: 'mock-baidu',
          name: '百度',
          description: '百度搜索（Mock 数据，用于预览工作台效果）',
          icon: 'https://www.baidu.com/favicon.ico',
          entryUrl: 'https://www.baidu.com',
          category: '工具',
          sort: 1,
        },
      ],
    } satisfies IListWorkbenchAppsRes,
  })
}
