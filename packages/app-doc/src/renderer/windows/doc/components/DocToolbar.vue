<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { Editor as TiptapEditor } from '@tiptap/vue-3'
import { useDocStore } from '../store/doc'

const props = defineProps<{
  editor?: TiptapEditor
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'export', format: 'md' | 'html' | 'txt' | 'json' | 'docx'): void
}>()

const store = useDocStore()

function chain(fn: (c: any) => void) {
  if (!props.editor || props.readOnly)
    return
  const c = props.editor.chain().focus()
  fn(c)
  c.run()
}

function run(command: string, args?: unknown) {
  chain(c => (c as any)[command](args))
}

function setHeading(level: number) {
  chain(c => level === 0 ? c.setParagraph() : c.toggleHeading({ level }))
}

function isActive(name: string, attrs?: Record<string, unknown>) {
  return !!props.editor?.isActive(name, attrs)
}

function insertBlock(kind: 'sheet' | 'board') {
  const title = kind === 'sheet' ? '多维表格' : '画板'
  const payload = kind === 'sheet'
    ? { columns: ['字段 A', '字段 B'], rows: [{ '字段 A': '', '字段 B': '' }] }
    : { nodes: [], edges: [] }
  void store.saveBlock(undefined, kind, title, JSON.stringify(payload))
  store.panel = 'blocks'
}

/** 生成一份当前文档内容的模板（模板中心能力）。 */
function saveAsTemplate() {
  const json = props.editor?.getJSON()
  if (!json)
    return
  void store.createTemplate(`${store.currentDoc?.title || '文档'} 模板`, JSON.stringify(json))
  store.panel = 'templates'
}
</script>

<template>
  <div class="tb">
    <div class="tb__group">
      <button class="tb__btn" title="撤销" :disabled="readOnly" @click="run('undo')">↶</button>
      <button class="tb__btn" title="重做" :disabled="readOnly" @click="run('redo')">↷</button>
    </div>
    <div class="tb__group">
      <button class="tb__btn" :class="{ 'is-active': isActive('paragraph') }" :disabled="readOnly" @click="setHeading(0)">正文</button>
      <button
        v-for="l in [1, 2, 3]"
        :key="l"
        class="tb__btn"
        :class="{ 'is-active': isActive('heading', { level: l }) }"
        :disabled="readOnly"
        @click="setHeading(l)"
      >H{{ l }}</button>
    </div>
    <div class="tb__group">
      <button class="tb__btn" :class="{ 'is-active': isActive('bold') }" :disabled="readOnly" @click="chain(c => c.toggleBold())"><b>B</b></button>
      <button class="tb__btn" :class="{ 'is-active': isActive('italic') }" :disabled="readOnly" @click="chain(c => c.toggleItalic())"><i>I</i></button>
      <button class="tb__btn" :class="{ 'is-active': isActive('strike') }" :disabled="readOnly" @click="chain(c => c.toggleStrike())"><s>S</s></button>
      <button class="tb__btn" :class="{ 'is-active': isActive('code') }" :disabled="readOnly" @click="chain(c => c.toggleCode())">&lt;/&gt;</button>
    </div>
    <div class="tb__group">
      <button class="tb__btn" :class="{ 'is-active': isActive('bulletList') }" :disabled="readOnly" @click="chain(c => c.toggleBulletList())">• 列表</button>
      <button class="tb__btn" :class="{ 'is-active': isActive('orderedList') }" :disabled="readOnly" @click="chain(c => c.toggleOrderedList())">1. 列表</button>
      <button class="tb__btn" :class="{ 'is-active': isActive('blockquote') }" :disabled="readOnly" @click="chain(c => c.toggleBlockquote())">❝ 引用</button>
      <button class="tb__btn" :class="{ 'is-active': isActive('codeBlock') }" :disabled="readOnly" @click="chain(c => c.toggleCodeBlock())">{ } 代码</button>
      <button class="tb__btn" :disabled="readOnly" @click="chain(c => c.setHorizontalRule())">— 分割线</button>
    </div>
    <div class="tb__group">
      <button class="tb__btn" :disabled="readOnly" title="插入多维表格块" @click="insertBlock('sheet')">▦ 表格块</button>
      <button class="tb__btn" :disabled="readOnly" title="插入画板块" @click="insertBlock('board')">◇ 画板块</button>
    </div>
    <div class="tb__spacer" />
    <div class="tb__group">
      <button class="tb__btn" :disabled="!store.currentDocId" @click="saveAsTemplate">存为模板</button>
      <div class="db-dropdown">
        <button class="tb__btn">导出 ▾</button>
        <div class="db-dropdown__menu">
          <button @click="emit('export', 'md')">Markdown</button>
          <button @click="emit('export', 'html')">HTML</button>
          <button @click="emit('export', 'txt')">纯文本</button>
          <button @click="emit('export', 'json')">ProseMirror JSON</button>
          <button @click="emit('export', 'docx')">Word (.docx)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tb {
  height: 38px; flex: none; display: flex; align-items: center; gap: 4px;
  padding: 0 10px; border-bottom: 1px solid #e8eaed; overflow-x: auto; background: #fff;
}
.tb__group { display: flex; align-items: center; gap: 2px; padding-right: 6px; border-right: 1px solid #e8eaed; flex: none; }
.tb__btn {
  min-width: 26px; height: 26px; padding: 0 6px; font-size: 12px;
  border: 1px solid transparent; border-radius: 5px; background: transparent; cursor: pointer; white-space: nowrap;
}
.tb__btn:hover:not(:disabled) { background: #f2f3f5; }
.tb__btn.is-active { background: #e1eaff; color: #245bdb; }
.tb__btn:disabled { opacity: .4; cursor: not-allowed; }
.tb__spacer { flex: 1; min-width: 8px; }
</style>
