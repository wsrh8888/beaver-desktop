/** 打开方式：0 内嵌 WebView，1 系统浏览器 */
export type WorkbenchOpenMode = 0 | 1

/** 入口类型：0 路由 key，1 H5 地址 */
export type WorkbenchEntryType = 0 | 1

export interface IWorkbenchEntryConfig {
  type: WorkbenchEntryType
  pc?: string
  mobile?: string
}

export interface IWorkbenchAppItem {
  workbenchAppId: string
  name: string
  description: string
  icon: string
  /** 0 内部，1 第三方 H5 */
  appType: number
  /** 0 全部，1 仅 PC，2 仅移动 */
  clientScope: number
  entryConfig: IWorkbenchEntryConfig
  category: number
  sort: number
  openMode: WorkbenchOpenMode
}

export interface IWorkbenchAppGroup {
  category: number
  categoryName: string
  list: IWorkbenchAppItem[]
}

export interface IListWorkbenchAppsReq {
  /** 1 PC，2 移动 */
  clientScope?: number
}

export interface IListWorkbenchAppsRes {
  groups: IWorkbenchAppGroup[]
}

/** 解析当前端入口：优先本端，回退另一端 */
export function resolveWorkbenchEntry(
  app: IWorkbenchAppItem,
  client: 'pc' | 'mobile' = 'pc',
): string {
  const cfg = app.entryConfig
  if (!cfg)
    return ''
  const primary = client === 'pc' ? cfg.pc : cfg.mobile
  const fallback = client === 'pc' ? cfg.mobile : cfg.pc
  return (primary || fallback || '').trim()
}
