<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { Editor as TiptapEditor } from '@tiptap/vue-3'
import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import type { DocSyncStatus } from './composables/useDocProvider'
import { importDocApi } from '@packageRender/api/doc'
import { computed, onMounted, ref } from 'vue'
import AuditPanel from './components/AuditPanel.vue'
import BlockPanel from './components/BlockPanel.vue'
import CommentPanel from './components/CommentPanel.vue'
import DocEditor from './components/DocEditor.vue'
import DocToolbar from './components/DocToolbar.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import PresenceBar from './components/PresenceBar.vue'
import SearchPanel from './components/SearchPanel.vue'
import ShareDialog from './components/ShareDialog.vue'
import Sidebar from './components/Sidebar.vue'
import TemplateCenter from './components/TemplateCenter.vue'
import TrashPanel from './components/TrashPanel.vue'
import { useDocStore } from './store/doc'

const store = useDocStore()

const userName = ref('我')
const userId = ref('')
const presence = ref<IDocPresence[]>([])
const connected = ref(false)
const syncStatus = ref<DocSyncStatus>('connecting')
const pendingCount = ref(0)
const readOnly = ref(false)
const editor = ref<TiptapEditor | undefined>()
const showShare = ref(false)
const showDiff = ref(false)
const diffResult = ref<{ addedLines: string[], removedLines: string[], baseText: string, targetText: string } | null>(null)
const baseRev = ref('')
const targetRev = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const toast = ref('')

const editorKey = computed(() => `${store.currentDocId}@${store.epoch}`)
const isFavorite = computed(() => store.favoriteIds.has(store.currentDocId))

function flash(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message)
      toast.value = ''
  }, 2600)
}

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
  try {
    const res = await importDocApi({
      spaceId: store.currentSpaceId,
      fileName: file.name,
      title: file.name,
      data: b64(await file.arrayBuffer()),
    })
    if (res.result?.docId) {
      await store.selectSpace(store.currentSpaceId)
      await store.openDoc(res.result.docId)
      flash(res.result.parsed ? `已导入 ${file.name}` : (res.result.message || '文件已保存为附件文档'))
    }
  }
  catch (err) {
    flash(err instanceof Error ? err.message : '导入失败')
  }
  input.value = ''
}

function download(name: string, mime: string, data: string | Uint8Array) {
  const blob = data instanceof Uint8Array
    ? new Blob([data as BlobPart], { type: mime })
    : new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

async function onExport(format: 'md' | 'html' | 'txt' | 'json' | 'docx') {
  const r = await store.exportDoc(format)
  if (!r)
    return
  if (format === 'docx' && r.data) {
    const bin = atob(r.data)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++)
      bytes[i] = bin.charCodeAt(i)
    download(r.fileName || 'document.docx', r.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes)
  }
  else {
    download(r.fileName || `document.${format}`, r.mimeType || 'text/plain;charset=utf-8', r.text || '')
  }
  flash(`已导出 ${format.toUpperCase()}`)
}

async function onCompare() {
  if (!baseRev.value || !targetRev.value) {
    flash('请先选择两个版本')
    return
  }
  const r = await store.diffRevisions(baseRev.value, targetRev.value)
  if (!r)
    return
  diffResult.value = r
  showDiff.value = true
}

async function onRollback(revisionId: string) {
  const r = await store.rollback(revisionId)
  if (r?.epoch)
    flash(`已回滚，协同纪元更新为 ${r.epoch}，正在重建会话`)
}

async function onDuplicate() {
  const r = await store.duplicateDoc(`${store.currentDoc?.title || '文档'} 副本`)
  if (r?.docId)
    flash('已创建副本')
}

async function onToggleFavorite() {
  await store.toggleFavorite()
  flash(isFavorite.value ? '已收藏' : '已取消收藏')
}

function onEpochChange(epoch: number) {
  store.epoch = epoch
  flash(`检测到文档版本更新（纪元 ${epoch}），正在重建协同会话`)
}

onMounted(async () => {
  await loadSelf()
  await Promise.all([
    store.loadSpaces(),
    store.loadRecent(),
    store.loadFavorites(),
    store.loadNotifications(),
  ])
  if (store.currentSpaceId)
    await store.selectSpace(store.currentSpaceId)
})
</script>

<template>
  <div class="doc-app">
    <Sidebar
      @import="fileInput?.click()"
      @export="onExport"
      @duplicate="onDuplicate"
    />

    <main class="doc-main">
      <header class="doc-topbar">
        <div class="doc-topbar__left">
          <span class="doc-crumb">{{ store.spaces.find(s => s.spaceId === store.currentSpaceId)?.name || '我的空间' }}</span>
          <span class="doc-crumb__sep">/</span>
          <span class="doc-title" :title="store.currentDoc?.title">
            {{ store.currentDoc?.icon || '📄' }} {{ store.currentDoc?.title || 'Beaver 文档' }}
          </span>
          <span v-if="store.currentDoc" class="db-chip">v{{ store.currentDoc.version }}</span>
          <span v-if="store.currentDoc" class="db-chip">纪元 {{ store.epoch }}</span>
          <span v-if="readOnly" class="db-chip db-chip--warn">只读</span>
        </div>

        <div class="doc-topbar__actions">
          <PresenceBar :presence="presence" :connected="connected" :status="syncStatus" :pending="pendingCount" />
          <button class="db-btn" :disabled="!store.currentDocId" :class="{ 'is-active': isFavorite }" title="收藏" @click="onToggleFavorite">
            {{ isFavorite ? '★' : '☆' }}
          </button>
          <button class="db-btn" :disabled="!store.currentDocId" title="评论" @click="store.setPanel('comments')">评论</button>
          <button class="db-btn" :disabled="!store.currentDocId" title="版本历史" @click="store.setPanel('history')">历史</button>
          <button class="db-btn" :disabled="!store.currentDocId" title="协作者" @click="store.setPanel('collab')">协作者</button>
          <button class="db-btn db-btn--primary" :disabled="!store.currentDocId" @click="showShare = true">分享</button>
          <div class="db-dropdown">
            <button class="db-btn">更多 ▾</button>
            <div class="db-dropdown__menu">
              <button @click="store.setPanel('search')">全文搜索</button>
              <button @click="store.setPanel('recent')">最近访问</button>
              <button @click="store.setPanel('favorites')">我的收藏</button>
              <button @click="store.setPanel('templates')">模板中心</button>
              <button @click="store.setPanel('trash')">回收站</button>
              <button @click="store.setPanel('notifications')">通知中心</button>
              <button @click="store.setPanel('audit')">操作审计</button>
              <button @click="store.setPanel('blocks')">富媒体块</button>
              <hr>
              <button @click="onExport('md')">导出 Markdown</button>
              <button @click="onExport('html')">导出 HTML</button>
              <button @click="onExport('docx')">导出 Word</button>
              <button @click="onExport('json')">导出 JSON</button>
              <button @click="onDuplicate">创建副本</button>
              <button :disabled="!store.currentDocId" @click="store.reindex()">重建知识库索引</button>
            </div>
          </div>
        </div>
      </header>

      <DocToolbar :editor="editor" :read-only="readOnly" @export="onExport" />

      <div class="doc-body">
        <section class="doc-canvas">
          <div v-if="store.currentDoc?.cover" class="doc-cover" :style="{ backgroundImage: `url(${store.currentDoc.cover})` }" />
          <DocEditor
            :key="editorKey"
            :doc-id="store.currentDocId"
            :user-name="userName"
            :user-id="userId"
            :initial-content-json="store.currentDoc?.contentJson"
            :epoch="store.epoch"
            :read-only="readOnly"
            @presence="presence = $event"
            @status="connected = $event"
            @sync="syncStatus = $event"
            @pending="pendingCount = $event"
            @ready="editor = $event"
            @read-only="readOnly = $event"
            @epoch-change="onEpochChange"
          />
        </section>

        <aside v-if="store.panel !== 'none'" class="doc-right">
          <div class="doc-right__head">
            <strong>{{ {
              none: '', history: '版本历史', comments: '评论与批注', collab: '协作者',
              audit: '操作审计', trash: '回收站', notifications: '通知中心',
              templates: '模板中心', search: '全文搜索', blocks: '富媒体块',
              recent: '最近访问', favorites: '我的收藏',
            }[store.panel] }}</strong>
            <button class="db-btn db-btn--ghost" @click="store.setPanel(store.panel)">×</button>
          </div>
          <div class="doc-right__body">
            <HistoryPanel
              v-if="store.panel === 'history'"
              :read-only="readOnly"
              v-model:base-revision="baseRev"
              v-model:target-revision="targetRev"
              @compare="onCompare"
              @rolled-back="onRollback"
            />
            <CommentPanel v-else-if="store.panel === 'comments'" :read-only="readOnly" :user-id="userId" />
            <SearchPanel v-else-if="store.panel === 'search'" />
            <TemplateCenter v-else-if="store.panel === 'templates'" />
            <TrashPanel v-else-if="store.panel === 'trash'" />
            <NotificationPanel v-else-if="store.panel === 'notifications'" />
            <AuditPanel v-else-if="store.panel === 'audit'" />
            <BlockPanel v-else-if="store.panel === 'blocks'" />
            <div v-else-if="store.panel === 'recent' || store.panel === 'favorites'" class="db-list">
              <div
                v-for="d in (store.panel === 'recent' ? store.recent : store.favorites)"
                :key="d.docId"
                class="db-item"
                @click="store.openDoc(d.docId)"
              >
                <span>{{ d.icon || '📄' }} {{ d.title }}</span>
                <small>{{ d.updatedAt }}</small>
              </div>
              <div v-if="!(store.panel === 'recent' ? store.recent : store.favorites).length" class="db-empty">暂无数据</div>
            </div>
            <div v-else-if="store.panel === 'collab'" class="db-list">
              <div v-for="c in store.collaborators" :key="`${c.userId}:${c.source}`" class="db-item">
                <span>{{ c.userId }}</span>
                <span class="db-chip">{{ c.role }}</span>
                <small>{{ c.source }}</small>
              </div>
              <div v-if="!store.collaborators.length" class="db-empty">暂无协作者</div>
            </div>
          </div>
        </aside>
      </div>

      <footer class="doc-statusbar">
        <span>{{ connected ? '实时协同已连接' : '连接中 / 离线' }}</span>
        <span>·</span>
        <span>{{ syncStatus }}</span>
        <span v-if="store.currentDoc?.ragEnabled" class="db-chip">知识库索引已开启</span>
        <span class="doc-statusbar__spacer" />
        <span>{{ store.currentDoc?.contentText?.slice(0, 60) || '' }}</span>
      </footer>
    </main>

    <ShareDialog v-if="showShare" @close="showShare = false" />

    <div v-if="showDiff" class="db-mask" @click.self="showDiff = false">
      <div class="db-dialog db-dialog--wide">
        <div class="db-dialog__head">
          <strong>版本对比</strong>
          <button class="db-btn db-btn--ghost" @click="showDiff = false">×</button>
        </div>
        <div class="db-diff">
          <div class="db-diff__col">
            <h4>删除的内容 ({{ diffResult?.removedLines.length || 0 }})</h4>
            <pre>-{{ (diffResult?.removedLines || []).join('\n-') }}</pre>
          </div>
          <div class="db-diff__col">
            <h4>新增的内容 ({{ diffResult?.addedLines.length || 0 }})</h4>
            <pre>+{{ (diffResult?.addedLines || []).join('\n+') }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.error" class="doc-toast doc-toast--error" @click="store.error = ''">
      {{ store.error }}
    </div>
    <div v-if="toast" class="doc-toast">{{ toast }}</div>

    <input ref="fileInput" type="file" accept=".docx,.pdf" style="display: none" @change="onFileChange">
  </div>
</template>

<style>
/* ===== 全局设计系统（供 app-doc 内所有面板复用） ===== */
.doc-app {
  --db-border: #e8eaed;
  --db-bg: #ffffff;
  --db-bg-soft: #f7f8fa;
  --db-primary: #3370ff;
  --db-text: #1f2329;
  --db-muted: #8f959e;
  --db-danger: #f54a45;
  --db-success: #34c724;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--db-text);
  background: var(--db-bg);
}
.db-btn {
  font-size: 12px;
  padding: 5px 10px;
  border: 1px solid var(--db-border);
  border-radius: 6px;
  background: #fff;
  color: var(--db-text);
  cursor: pointer;
  white-space: nowrap;
}
.db-btn:hover:not(:disabled) { background: var(--db-bg-soft); }
.db-btn:disabled { opacity: .45; cursor: not-allowed; }
.db-btn.is-active { color: var(--db-primary); border-color: var(--db-primary); }
.db-btn--primary { background: var(--db-primary); border-color: var(--db-primary); color: #fff; }
.db-btn--primary:hover:not(:disabled) { background: #245bdb; }
.db-btn--ghost { border: none; background: transparent; font-size: 16px; }
.db-btn--danger { color: var(--db-danger); }
.db-input, .db-select, .db-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 9px;
  font-size: 12px;
  border: 1px solid var(--db-border);
  border-radius: 6px;
  background: #fff;
  color: var(--db-text);
  outline: none;
}
.db-input:focus, .db-select:focus, .db-textarea:focus { border-color: var(--db-primary); }
.db-textarea { min-height: 72px; resize: vertical; font-family: inherit; }
.db-chip {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 4px;
  background: var(--db-bg-soft);
  color: var(--db-muted);
}
.db-chip--warn { background: #fff3e0; color: #d97706; }
.db-list { display: flex; flex-direction: column; }
.db-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-bottom: 1px solid var(--db-border);
  font-size: 12px;
  cursor: pointer;
}
.db-item:hover { background: var(--db-bg-soft); }
.db-item > span:first-child { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-item small { color: var(--db-muted); font-size: 11px; white-space: nowrap; }
.db-empty { padding: 20px 10px; text-align: center; color: var(--db-muted); font-size: 12px; }
.db-section { padding: 10px; border-bottom: 1px solid var(--db-border); }
.db-section__title { font-size: 11px; font-weight: 600; color: var(--db-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .04em; }
.db-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
.db-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 18, 25, .38);
  display: flex; align-items: center; justify-content: center;
}
.db-dialog {
  width: 460px; max-height: 82vh; display: flex; flex-direction: column;
  background: #fff; border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.18); overflow: hidden;
}
.db-dialog--wide { width: 800px; }
.db-dialog__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--db-border); font-size: 14px;
}
.db-dialog__body { padding: 14px 16px; overflow: auto; }
.db-dialog__foot { padding: 10px 16px; border-top: 1px solid var(--db-border); display: flex; justify-content: flex-end; gap: 8px; }
.db-dropdown { position: relative; }
.db-dropdown__menu {
  display: none; position: absolute; right: 0; top: calc(100% + 4px); z-index: 50;
  min-width: 180px; padding: 4px; background: #fff;
  border: 1px solid var(--db-border); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.12);
}
.db-dropdown:hover .db-dropdown__menu { display: block; }
.db-dropdown__menu button {
  display: block; width: 100%; text-align: left; padding: 7px 10px;
  font-size: 12px; border: none; background: transparent; border-radius: 5px; cursor: pointer;
}
.db-dropdown__menu button:hover { background: var(--db-bg-soft); }
.db-dropdown__menu button:disabled { opacity: .45; }
.db-dropdown__menu hr { border: none; border-top: 1px solid var(--db-border); margin: 4px 0; }
.db-diff { display: flex; gap: 12px; padding: 14px 16px; overflow: auto; max-height: 60vh; }
.db-diff__col { flex: 1; min-width: 0; }
.db-diff__col h4 { font-size: 12px; margin: 0 0 8px; }
.db-diff__col pre {
  margin: 0; padding: 10px; background: var(--db-bg-soft); border-radius: 6px;
  font-size: 11px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; max-height: 52vh; overflow: auto;
}
</style>

<style scoped>
.doc-app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-size: 13px;
}
.doc-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.doc-topbar {
  height: 48px; flex: none; display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px; border-bottom: 1px solid #e8eaed; gap: 12px;
}
.doc-topbar__left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.doc-topbar__actions { display: flex; align-items: center; gap: 6px; flex: none; }
.doc-crumb { color: #8f959e; font-size: 12px; white-space: nowrap; }
.doc-crumb__sep { color: #c9cdd4; }
.doc-title { font-weight: 600; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-body { flex: 1; display: flex; min-height: 0; }
.doc-canvas { flex: 1; min-width: 0; overflow: auto; position: relative; }
.doc-cover { height: 160px; background-size: cover; background-position: center; }
.doc-right {
  width: 320px; flex: none; border-left: 1px solid #e8eaed;
  display: flex; flex-direction: column; background: #fff; min-height: 0;
}
.doc-right__head {
  height: 40px; flex: none; display: flex; align-items: center; justify-content: space-between;
  padding: 0 12px; border-bottom: 1px solid #e8eaed; font-size: 13px;
}
.doc-right__body { flex: 1; overflow: auto; min-height: 0; }
.doc-statusbar {
  height: 26px; flex: none; display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-top: 1px solid #e8eaed; font-size: 11px; color: #8f959e;
}
.doc-statusbar__spacer { flex: 1; }
.doc-toast {
  position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
  padding: 8px 16px; background: #1f2329; color: #fff; font-size: 12px;
  border-radius: 8px; z-index: 2000; box-shadow: 0 6px 20px rgba(0,0,0,.2); cursor: pointer;
}
.doc-toast--error { background: #f54a45; }
</style>
