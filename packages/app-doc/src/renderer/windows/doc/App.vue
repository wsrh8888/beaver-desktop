<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import { importDocApi, reindexDocApi } from '@packageRender/api/doc'
import { computed, onMounted, ref } from 'vue'
import DocEditor from './components/DocEditor.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import NodeTree from './components/NodeTree.vue'
import PresenceBar from './components/PresenceBar.vue'
import ShareDialog from './components/ShareDialog.vue'
import { useDocStore } from './store/doc'

const store = useDocStore()

// 当前登录用户（presence/awareness 展示用）：取 electron storage userInfo。
const userName = ref('我')
const userId = ref('')
const presence = ref<IDocPresence[]>([])
const connected = ref(false)
const showHistory = ref(true)
const showShare = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const currentDocId = computed(() => store.currentDoc?.docId || '')

async function loadSelf() {
  const bridge = ((globalThis as any).electron || (globalThis as any).window?.electron)
  try {
    const info = await bridge?.storage?.getAsync?.('userInfo')
    if (info?.userId)
      userId.value = info.userId
    if (info?.name)
      userName.value = info.name
  }
  catch { /* 未登录窗口下忽略 */ }
}

function onOpenDoc(docId: string) {
  store.openDoc(docId)
}

function onNewPage() {
  if (!store.currentSpaceId)
    return
  store.addPage(store.currentSpaceId, '', `未命名文档 ${Date.now() % 10000}`)
}

async function onImportClick() {
  fileInput.value?.click()
}

function b64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i++)
    bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

async function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !store.currentSpaceId)
    return
  const buf = await file.arrayBuffer()
  const res = await importDocApi({
    spaceId: store.currentSpaceId,
    fileName: file.name,
    title: file.name,
    data: b64(buf),
  })
  const docId = res.result?.docId
  if (docId) {
    await store.selectSpace(store.currentSpaceId)
    await store.openDoc(docId)
  }
  input.value = ''
}

async function onReindex() {
  if (currentDocId.value)
    await reindexDocApi({ docId: currentDocId.value })
}

onMounted(async () => {
  await loadSelf()
  await store.loadSpaces()
  if (store.currentSpaceId)
    await store.selectSpace(store.currentSpaceId)
})
</script>

<template>
  <div class="doc-app">
    <NodeTree
      :spaces="store.spaces"
      :nodes="store.nodes"
      :current-space-id="store.currentSpaceId"
      :current-doc-id="currentDocId"
      @select-space="store.selectSpace"
      @open-doc="onOpenDoc"
      @new-page="onNewPage"
      @import="onImportClick"
    />

    <main class="doc-app__main">
      <header class="doc-app__topbar">
        <div class="doc-app__title">
          {{ store.currentDoc?.title || 'Beaver 文档' }}
          <span v-if="store.currentDoc" class="doc-app__ver">v{{ store.currentDoc.version }}</span>
        </div>
        <div class="doc-app__actions">
          <PresenceBar :presence="presence" :connected="connected" />
          <button :disabled="!currentDocId" @click="onReindex">重建索引</button>
          <button :disabled="!currentDocId" @click="showHistory = !showHistory">
            {{ showHistory ? '收起历史' : '版本历史' }}
          </button>
          <button :disabled="!currentDocId" @click="showShare = true">分享</button>
        </div>
      </header>

      <div class="doc-app__body">
        <div class="doc-app__editor">
          <!-- :key 绑定 docId：切文档即重建编辑器 + provider，避免脏连接残留 -->
          <DocEditor
            :key="currentDocId"
            :doc-id="currentDocId"
            :user-name="userName"
            :user-id="userId"
            @presence="presence = $event"
            @status="connected = $event"
          />
        </div>
        <HistoryPanel
          v-if="showHistory"
          :doc-id="currentDocId"
          @rolled-back="store.openDoc(currentDocId)"
        />
      </div>
    </main>

    <ShareDialog
      v-if="showShare && store.currentDoc"
      resource-type="doc"
      :resource-id="currentDocId"
      @close="showShare = false"
    />

    <input
      ref="fileInput"
      type="file"
      accept=".docx,.pdf"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
.doc-app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.doc-app__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.doc-app__topbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #ececec;
}
.doc-app__title {
  font-weight: 600;
}
.doc-app__ver {
  font-size: 12px;
  color: #9aa0a6;
  margin-left: 6px;
}
.doc-app__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.doc-app__actions button {
  font-size: 13px;
  padding: 5px 10px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.doc-app__actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.doc-app__body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.doc-app__editor {
  flex: 1;
  min-width: 0;
}
</style>
