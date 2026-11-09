<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import { DOC_YTEXT_NAME } from '@packageCommon'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { createDocProvider, readPresence } from '../composables/useDocProvider'

const props = defineProps<{
  docId: string
  userName: string
  userId: string
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'presence', list: IDocPresence[]): void
  (e: 'status', connected: boolean): void
}>()

let provider: any = null
let ydoc: any = null

// StarterKit 关闭内置 history（撤销交给 Yjs），协同场景必须。
const baseExtensions = () => [
  StarterKit.configure({ history: false }),
  Placeholder.configure({ placeholder: '开始编辑…' }),
]

function buildUser() {
  return { name: props.userName || '协作者', color: '#3b82f6' }
}

async function setup() {
  if (!props.docId)
    return
  const created = await createDocProvider(props.docId, props.userName, props.userId)
  ydoc = created.ydoc
  provider = created.provider

  provider.on('status', ({ status }: { status: string }) => emit('status', status === 'connected'))
  provider.awareness?.on('change', () => emit('presence', readPresence(provider.awareness)))

  editor.value = useEditor({
    editable: !props.readOnly,
    extensions: [
      ...baseExtensions(),
      Collaboration.configure({ document: ydoc, field: DOC_YTEXT_NAME, type: 'text' }),
      CollaborationCursor.configure({ provider, user: buildUser() }),
    ],
  })
  emit('presence', readPresence(provider.awareness))
}

// useEditor 返回的是 shallowRef，重配时用变量承接。
const editor = shallowRef<ReturnType<typeof useEditor>>(null) as any

function teardown() {
  try {
    editor.value?.destroy()
  }
  catch { /* noop */ }
  try {
    provider?.destroy()
  }
  catch { /* noop */ }
  try {
    ydoc?.destroy()
  }
  catch { /* noop */ }
  editor.value = null
  provider = null
  ydoc = null
}

watch(() => props.docId, () => {
  teardown()
  setup()
})

setup()

onBeforeUnmount(teardown)
</script>

<template>
  <div class="doc-editor">
    <div v-if="!docId" class="doc-editor__empty">选择左侧文档开始编辑</div>
    <EditorContent v-else :editor="editor" />
  </div>
</template>

<style scoped>
.doc-editor {
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
:deep(.ProseMirror) {
  min-height: 100%;
  padding: 24px 32px;
  outline: none;
}
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: #adb5bd;
  pointer-events: none;
}
</style>
