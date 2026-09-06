<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  <div class="workbench-viewer">
    <div ref="hostRef" class="workbench-viewer-host" />

    <div v-if="loading && !workbenchStore.isHomeTab" class="workbench-viewer-overlay">
      <div class="workbench-viewer-spinner" />
      <span>加载中...</span>
    </div>

    <div v-if="loadFailed && !workbenchStore.isHomeTab" class="workbench-viewer-overlay workbench-viewer-overlay-error">
      <p>页面加载失败</p>
      <button class="workbench-viewer-retry" type="button" @click="handleReload">
        重试
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')

import { resolveWorkbenchEntry } from 'commonModule/type/ajax/workbench'
import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { HOME_TAB_ID, useWorkbenchStore } from 'renderModule/windows/workbench/store/workbench/workbench'

export default defineComponent({
  name: 'WorkbenchViewer',
  setup() {
    logger.info({ text: 'setup 开始' })
    const workbenchStore = useWorkbenchStore()
    const hostRef = ref<HTMLDivElement | null>(null)
    const loading = ref(false)
    const loadFailed = ref(false)
    let resizeObserver: ResizeObserver | null = null
    let prevTabIds: string[] = []

    const getBounds = () => {
    logger.info({ text: 'getBounds 开始' })
      const el = hostRef.value
      if (!el)
        return null
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0)
        return null
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }

    const syncBounds = () => {
    logger.info({ text: 'syncBounds 开始' })
      const bounds = getBounds()
      const tabId = workbenchStore.activeTabId
      if (!bounds || workbenchStore.isHomeTab || !tabId || tabId === HOME_TAB_ID)
        return
      electron.workbench.setEmbedBounds({ tabId, bounds })
    }

    const showActiveTabEmbed = async () => {
    logger.info({ text: 'showActiveTabEmbed 开始' })
      const tabId = workbenchStore.activeTabId
      if (workbenchStore.isHomeTab || !tabId || tabId === HOME_TAB_ID) {
        await electron.workbench.hideAllEmbeds()
        return
      }

      const tab = workbenchStore.tabs.find(item => item.id === tabId)
      const url = tab?.app ? resolveWorkbenchEntry(tab.app, 'pc') : ''
      if (!url)
        return

      await nextTick()
      const bounds = getBounds()
      if (!bounds)
        return

      loading.value = true
      loadFailed.value = false
      await electron.workbench.openEmbed({ tabId, url, bounds })
    }

    const handleReload = () => {
    logger.info({ text: 'handleReload 开始' })
      const tabId = workbenchStore.activeTabId
      if (!tabId || tabId === HOME_TAB_ID)
        return
      loading.value = true
      loadFailed.value = false
      electron.workbench.reloadEmbed({ tabId })
    }

    const handleRefreshEvent = () => {
    logger.info({ text: 'handleRefreshEvent 开始' })
      handleReload()
    }

    const handleVisibilityChange = () => {
    logger.info({ text: 'handleVisibilityChange 开始' })
      if (document.visibilityState === 'visible')
        showActiveTabEmbed()
    }

    const handleEmbedState = (_event: unknown, payload: { tabId: string, state: string }) => {
    logger.info({ text: 'handleEmbedState 开始' })
      if (payload.tabId !== workbenchStore.activeTabId)
        return
      if (payload.state === 'loading') {
        loading.value = true
        loadFailed.value = false
      }
      if (payload.state === 'loaded') {
        loading.value = false
        loadFailed.value = false
      }
      if (payload.state === 'failed') {
        loading.value = false
        loadFailed.value = true
      }
    }

    const syncClosedTabs = (tabIds: string[]) => {
    logger.info({ text: 'syncClosedTabs 开始' })
      const removedIds = prevTabIds.filter(id => id !== HOME_TAB_ID && !tabIds.includes(id))
      removedIds.forEach((tabId) => {
        electron.workbench.closeEmbed({ tabId })
      })
      prevTabIds = [...tabIds]
    }

    watch(() => workbenchStore.activeTabId, () => {
      showActiveTabEmbed()
    })

    watch(() => workbenchStore.tabs.map(tab => tab.id), (tabIds) => {
      syncClosedTabs(tabIds)
    }, { immediate: true })

    onMounted(async () => {
      electron.workbench.onEmbedState(handleEmbedState)
      window.addEventListener('workbench-viewer-refresh', handleRefreshEvent)
      window.addEventListener('resize', syncBounds)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      if (hostRef.value) {
        resizeObserver = new ResizeObserver(() => {
          syncBounds()
        })
        resizeObserver.observe(hostRef.value)
      }

      await showActiveTabEmbed()
    })

    onUnmounted(() => {
      electron.workbench.offEmbedState(handleEmbedState)
      window.removeEventListener('workbench-viewer-refresh', handleRefreshEvent)
      window.removeEventListener('resize', syncBounds)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resizeObserver?.disconnect()
    })

    return {
      hostRef,
      loading,
      loadFailed,
      workbenchStore,
      handleReload,
    }
  },
})
</script>

<style lang="less" scoped>
.workbench-viewer {
  position: absolute;
  inset: 0;
  background: #FFFFFF;
}

.workbench-viewer-host {
  width: 100%;
  height: 100%;
}

.workbench-viewer-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  color: #636E72;
  font-size: 14px;
  pointer-events: none;
}

.workbench-viewer-overlay-error {
  pointer-events: auto;

  p {
    margin: 0 0 12px;
    color: #2D3436;
  }
}

.workbench-viewer-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EBEEF5;
  border-top-color: #FF7D45;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.workbench-viewer-retry {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: #FFFFFF;
  font-size: 13px;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
