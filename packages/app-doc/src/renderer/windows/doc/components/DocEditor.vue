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
import { DOC_XML_FRAGMENT_NAME } from '@packageCommon'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import {
  createDocProvider,
  type DocSyncStatus,
  type IDocProviderHandle,
} from '../composables/useDocProvider'

const props = defineProps<{
  docId: string
  userName: string
  userId: string
  readOnly?: boolean
  /** 无 CRDT 状态时用于播种的权威 ProseMirror JSON（新建 / 导入 / 回滚后）。 */
  initialContentJson?: string
  /** 外部已知的纪元（回滚后由调用方传入新值，触发重建）。 */
  epoch?: number
}>()

const emit = defineEmits<{
  (e: 'presence', list: IDocPresence[]): void
  (e: 'status', connected: boolean): void
  (e: 'sync', status: DocSyncStatus, detail?: unknown): void
  (e: 'pending', count: number): void
  (e: 'epochChange', epoch: number): void
  (e: 'ready', editor: TiptapEditor | undefined): void
  (e: 'readOnly', value: boolean): void
}>()

/** 自增生代次：纪元变化或 docId 切换时递增，用于强制重建编辑器。 */
const generation = ref(0)
const editor = shallowRef<TiptapEditor | undefined>()
const syncStatus = ref<DocSyncStatus>('connecting')
const pendingCount = ref(0)
const readOnlyState = ref(false)
const errorMessage = ref('')

let handle: IDocProviderHandle | null = null
let disposed = false
let setupToken = 0

function teardown() {
  try {
    editor.value?.destroy()
  }
  catch { /* noop */ }
  editor.value = undefined
  emit('ready', undefined)
  try {
    handle?.destroy()
  }
  catch { /* noop */ }
  handle = null
  pendingCount.value = 0
  emit('pending', 0)
  syncStatus.value = 'connecting'
}

/** 空 CRDT 文档用权威 contentJson 播种，否则写入 Y.XmlFragment 形成初始 block。 */
function seedIfEmpty(instance: TiptapEditor | undefined, fragmentEmpty: boolean) {
  if (!instance || !fragmentEmpty || !props.initialContentJson)
    return
  try {
    const json = JSON.parse(props.initialContentJson)
    if (json?.type === 'doc')
      instance.commands.setContent(json, false)
  }
  catch {
    // contentJson 非法时保持空文档，不阻断协同。
  }
}

async function setup() {
  const token = ++setupToken
  if (!props.docId)
    return
  errorMessage.value = ''
  try {
    const created = await createDocProvider({
      docId: props.docId,
      userId: props.userId,
      userName: props.userName,
      readOnly: props.readOnly,
      epoch: props.epoch,
      onStatus: (status, detail) => {
        syncStatus.value = status
        emit('sync', status, detail)
        emit('status', status === 'connected' || status === 'synced')
      },
      onPresence: list => emit('presence', list),
      onPending: (count) => {
        pendingCount.value = count
        emit('pending', count)
      },
      onEpochChange: (epoch) => {
        emit('epochChange', epoch)
        // 服务端纪元已变：销毁旧 Y.Doc 并按新纪元重建，杜绝旧状态回写。
        if (!disposed)
          generation.value += 1
      },
      onError: (error) => {
        errorMessage.value = error instanceof Error ? error.message : String(error)
      },
    })
    // 异步期间可能已切换文档/纪元，丢弃过期结果。
    if (disposed || token !== setupToken) {
      created.destroy()
      return
    }
    handle = created
    readOnlyState.value = created.readOnly
    emit('readOnly', created.readOnly)

    const fragment = created.ydoc.getXmlFragment(DOC_XML_FRAGMENT_NAME)
    const fragmentEmpty = fragment.length === 0

    const instance = new Editor({
      editable: !created.readOnly,
      extensions: [
        // history 必须关闭：撤销/重做由 Yjs UndoManager 统一负责。
        StarterKit.configure({ history: false }),
        Placeholder.configure({ placeholder: '输入正文，或按 / 插入内容…' }),
        Collaboration.configure({ document: created.ydoc, field: DOC_XML_FRAGMENT_NAME }),
        CollaborationCursor.configure({
          provider: created.provider,
          user: { name: props.userName || '协作者', color: '#3b82f6' },
        }),
      ],
    })
    editor.value = instance
    emit('ready', instance)
    seedIfEmpty(instance, fragmentEmpty && !created.hasServerState)
  }
  catch (error) {
    if (!disposed && token === setupToken)
      errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}

watch(
  () => [props.docId, props.epoch, generation.value] as const,
  () => {
    teardown()
    void setup()
  },
)

watch(() => props.readOnly, (value) => {
  if (!handle || !editor.value)
    return
  readOnlyState.value = !!value
  editor.value.setEditable(!value)
  handle.setReadOnly(!!value)
})

void setup()

onBeforeUnmount(() => {
  disposed = true
  setupToken += 1
  teardown()
})
</script>

<template>
  <div class="doc-editor">
    <div v-if="!docId" class="doc-editor__empty">
      选择左侧文档开始编辑
    </div>
    <template v-else>
      <div v-if="errorMessage" class="doc-editor__error">
        协同异常：{{ errorMessage }}
      </div>
      <div class="doc-editor__meta">
        <span :class="['doc-editor__dot', `is-${syncStatus}`]" />
        <span>{{ syncStatus }}</span>
        <span v-if="pendingCount > 0" class="doc-editor__pending">{{ pendingCount }} 项待同步</span>
        <span v-if="readOnlyState" class="doc-editor__readonly">只读</span>
      </div>
      <EditorContent :editor="editor" />
    </template>
  </div>
</template>

<style scoped>
.doc-editor {
  position: relative;
  height: 100%;
  overflow: auto;
}
.doc-editor__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9aa0a6;
}
.doc-editor__error {
  padding: 8px 16px;
  background: #fff1f0;
  color: #cf1322;
  font-size: 12px;
}
.doc-editor__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 32px 0;
  font-size: 11px;
  color: #9aa0a6;
}
.doc-editor__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d0d7de;
}
.doc-editor__dot.is-synced,
.doc-editor__dot.is-connected {
  background: #10b981;
}
.doc-editor__dot.is-offline,
.doc-editor__dot.is-reconnecting,
.doc-editor__dot.is-disconnected {
  background: #f59e0b;
}
.doc-editor__dot.is-error,
.doc-editor__dot.is-epochChanged {
  background: #e5484d;
}
.doc-editor__pending {
  margin-left: 6px;
  color: #f59e0b;
}
.doc-editor__readonly {
  margin-left: 6px;
  padding: 1px 6px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
}
:deep(.ProseMirror) {
  min-height: calc(100% - 24px);
  padding: 24px 32px 96px;
  outline: none;
  line-height: 1.7;
}
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: #adb5bd;
  pointer-events: none;
}
:deep(.collaboration-cursor__caret) {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  word-break: normal;
  pointer-events: none;
}
:deep(.collaboration-cursor__label) {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
  color: #0d0d0d;
  padding: 1px 4px;
  border-radius: 3px;
  user-select: none;
}
</style>
