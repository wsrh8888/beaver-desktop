/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { IWorkbenchAppGroup, IWorkbenchAppItem } from 'commonModule/type/ajax/workbench'
import { resolveWorkbenchEntry } from 'commonModule/type/ajax/workbench'
import { defineStore } from 'pinia'
import Message from 'renderModule/components/ui/message'
import { listWorkbenchAppsApi } from 'renderModule/api/workbench'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('WorkbenchStore')

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
      logger.info({ text: '开始加载工作台应用列表', data: { clientScope: 1 } })

      try {
        const res = await listWorkbenchAppsApi({ clientScope: 1 })
        if (res.code !== 0) {
          this.loadError = res.msg || '获取应用列表失败'
          logger.error({ text: '获取工作台应用列表失败', data: { code: res.code, msg: res.msg } })
          Message.error(this.loadError)
          return
        }
        this.groups = res.result.groups || []
        logger.info({ text: '加载工作台应用列表成功', data: { groupCount: this.groups.length } })
      }
      catch (error) {
        this.loadError = '获取应用列表异常'
        logger.error({ text: '获取工作台应用列表异常', data: { error } })
        Message.error(this.loadError)
      }
      finally {
        this.loading = false
      }
    },
    switchTab(tabId: string) {
      if (!this.tabs.some(tab => tab.id === tabId))
        return
      this.activeTabId = tabId
    },
    openApp(app: IWorkbenchAppItem) {
      const entry = resolveWorkbenchEntry(app, 'pc')
      if (!entry) {
        logger.error({ text: '打开应用失败：应用入口无效', data: { appId: app.workbenchAppId, name: app.name, entryConfig: app.entryConfig } })
        Message.error('应用入口无效')
        return
      }

      // 内部应用 / 路由入口：走原生窗口
      if (Number(app.appType) === 0 || Number(app.entryConfig?.type) === 0) {
        const handler = INTERNAL_ROUTE_HANDLERS[entry]
        if (!handler) {
          logger.error({ text: '打开应用失败：未知内部应用', data: { appId: app.workbenchAppId, name: app.name, entry } })
          Message.error(`未知内部应用：${entry}`)
          return
        }
        logger.info({ text: '打开内部应用', data: { appId: app.workbenchAppId, name: app.name, entry } })
        handler()
        return
      }

      // openMode: 1 = 系统浏览器打开，不创建内嵌 Tab
      if (Number(app.openMode) === 1) {
        logger.info({ text: '使用系统浏览器打开应用', data: { appId: app.workbenchAppId, name: app.name, entry } })
        void electron.workbench.openExternal({ url: entry })
        return
      }

      const existing = this.tabs.find(tab => tab.id === app.workbenchAppId)
      if (existing) {
        this.activeTabId = existing.id
        logger.info({ text: '切换到已打开的应用标签', data: { appId: app.workbenchAppId } })
      }
      else {
        this.tabs.push({
          id: app.workbenchAppId,
          title: app.name,
          type: 'app',
          app,
        })
        this.activeTabId = app.workbenchAppId
        logger.info({ text: '新建应用标签', data: { appId: app.workbenchAppId, name: app.name, entry } })
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
