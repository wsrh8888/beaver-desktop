import type { IWorkbenchAppGroup, IWorkbenchAppItem } from 'commonModule/type/ajax/workbench'
import { resolveWorkbenchEntry } from 'commonModule/type/ajax/workbench'
import { defineStore } from 'pinia'
import Message from 'renderModule/components/ui/message'
import { listWorkbenchAppsApi } from 'renderModule/api/workbench'

export const HOME_TAB_ID = 'home'

/** 内部应用路由 key → 打开方式 */
const INTERNAL_ROUTE_HANDLERS: Record<string, () => void> = {
  moment: () => {
    electron.window.openWindow('moment', { unique: true })
  },
}

export interface IWorkbenchTab {
  id: string
  title: string
  type: 'home' | 'app'
  app?: IWorkbenchAppItem
}

export const useWorkbenchStore = defineStore('useWorkbenchStore', {
  state: () => ({
    groups: [] as IWorkbenchAppGroup[],
    tabs: [
      { id: HOME_TAB_ID, title: '工作台', type: 'home' },
    ] as IWorkbenchTab[],
    activeTabId: HOME_TAB_ID,
    loading: false,
    loadError: '',
  }),
  getters: {
    isHomeTab(state): boolean {
      return state.activeTabId === HOME_TAB_ID
    },
    activeApp(state): IWorkbenchAppItem | null {
      const tab = state.tabs.find(item => item.id === state.activeTabId)
      return tab?.type === 'app' ? tab.app || null : null
    },
    isEmpty(state): boolean {
      return !state.groups.some(group => (group.list || []).length > 0)
    },
  },
  actions: {
    async loadApps() {
      this.loading = true
      this.loadError = ''
      const res = await listWorkbenchAppsApi({ clientScope: 1 })
      this.loading = false
      if (res.code !== 0) {
        this.loadError = res.msg || '获取应用列表失败'
        Message.error(this.loadError)
        return
      }
      this.groups = res.result.groups || []
    },
    switchTab(tabId: string) {
      if (!this.tabs.some(tab => tab.id === tabId))
        return
      this.activeTabId = tabId
    },
    openApp(app: IWorkbenchAppItem) {
      const entry = resolveWorkbenchEntry(app, 'pc')
      if (!entry) {
        Message.error('应用入口无效')
        return
      }

      // 内部应用 / 路由入口：走原生窗口
      if (Number(app.appType) === 0 || Number(app.entryConfig?.type) === 0) {
        const handler = INTERNAL_ROUTE_HANDLERS[entry]
        if (!handler) {
          Message.error(`未知内部应用：${entry}`)
          return
        }
        handler()
        return
      }

      // openMode: 1 = 系统浏览器打开，不创建内嵌 Tab
      if (Number(app.openMode) === 1) {
        void electron.workbench.openExternal({ url: entry })
        return
      }

      const existing = this.tabs.find(tab => tab.id === app.workbenchAppId)
      if (existing) {
        this.activeTabId = existing.id
      }
      else {
        this.tabs.push({
          id: app.workbenchAppId,
          title: app.name,
          type: 'app',
          app,
        })
        this.activeTabId = app.workbenchAppId
      }
    },
    closeTab(tabId: string) {
      if (tabId === HOME_TAB_ID)
        return

      const index = this.tabs.findIndex(tab => tab.id === tabId)
      if (index < 0)
        return

      this.tabs.splice(index, 1)

      if (this.activeTabId === tabId)
        this.activeTabId = HOME_TAB_ID
    },
  },
})
