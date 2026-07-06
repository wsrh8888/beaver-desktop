import type { IWorkbenchAppItem } from 'commonModule/type/ajax/workbench'
import { defineStore } from 'pinia'
import Message from 'renderModule/components/ui/message'
import { listWorkbenchAppsApi } from 'renderModule/api/workbench'

export const HOME_TAB_ID = 'home'

export interface IWorkbenchTab {
  id: string
  title: string
  type: 'home' | 'app'
  app?: IWorkbenchAppItem
}

export const useWorkbenchStore = defineStore('useWorkbenchStore', {
  state: () => ({
    appList: [] as IWorkbenchAppItem[],
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
  },
  actions: {
    async loadApps() {
      this.loading = true
      this.loadError = ''
      const res = await listWorkbenchAppsApi()
      this.loading = false
      if (res.code !== 0) {
        this.loadError = res.msg || '获取应用列表失败'
        Message.error(this.loadError)
        return
      }
      this.appList = (res.result.list || []).sort((a, b) => a.sort - b.sort)
    },
    switchTab(tabId: string) {
      if (!this.tabs.some(tab => tab.id === tabId))
        return
      this.activeTabId = tabId
    },
    openApp(app: IWorkbenchAppItem) {
      if (!app.entryUrl) {
        Message.error('应用入口地址无效')
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
