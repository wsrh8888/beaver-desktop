export interface IWorkbenchAppItem {
  workbenchAppId: string
  name: string
  description: string
  icon: string
  entryUrl: string
  category: string
  sort: number
}

export interface IListWorkbenchAppsReq {
  category?: string
}

export interface IListWorkbenchAppsRes {
  list: IWorkbenchAppItem[]
}
