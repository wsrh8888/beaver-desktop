<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IDocBlockItem } from '@packageCommon/type/ajax/doc'
import { ref, watch } from 'vue'
import { useDocStore } from '../store/doc'

const store = useDocStore()
const editing = ref('')
const kind = ref<'sheet' | 'board'>('sheet')
const title = ref('')
const payloadText = ref('')
const parseError = ref('')

/** 多维表格块的只读预览；画板块只展示原始 payload。 */
function preview(block: IDocBlockItem): { columns: string[], rows: Record<string, string>[] } | null {
  if (block.kind !== 'sheet')
    return null
  try {
    const p = JSON.parse(block.payloadJson)
    return { columns: p.columns || [], rows: p.rows || [] }
  }
  catch {
    return null
  }
}

function freshPayload() {
  return kind.value === 'sheet'
    ? { columns: ['字段 A', '字段 B'], rows: [{ '字段 A': '', '字段 B': '' }] }
    : { nodes: [], edges: [] }
}

function startNew() {
  editing.value = '__new__'
  title.value = kind.value === 'sheet' ? '多维表格' : '画板'
  payloadText.value = JSON.stringify(freshPayload(), null, 2)
  parseError.value = ''
}

function startEdit(block: IDocBlockItem) {
  editing.value = block.blockId
  kind.value = block.kind === 'board' ? 'board' : 'sheet'
  title.value = block.title
  payloadText.value = block.payloadJson
  parseError.value = ''
}

async function save() {
  try {
    JSON.parse(payloadText.value)
  }
  catch {
    parseError.value = 'payloadJson 不是合法 JSON'
    return
  }
  const id = editing.value === '__new__' ? undefined : editing.value
  await store.saveBlock(id, kind.value, title.value, payloadText.value)
  editing.value = ''
  parseError.value = ''
}

function addColumn() {
  try {
    const p = JSON.parse(payloadText.value)
    p.columns = p.columns || []
    p.columns.push(`字段 ${p.columns.length + 1}`)
    ;(p.rows || []).forEach((r: Record<string, string>) => {
      r[p.columns[p.columns.length - 1]] = ''
    })
    payloadText.value = JSON.stringify(p, null, 2)
  }
  catch { /* noop */ }
}

function addRow() {
  try {
    const p = JSON.parse(payloadText.value)
    p.rows = p.rows || []
    const row: Record<string, string> = {}
    ;(p.columns || []).forEach((c: string) => { row[c] = '' })
    p.rows.push(row)
    payloadText.value = JSON.stringify(p, null, 2)
  }
  catch { /* noop */ }
}

watch(() => store.panel, (p) => {
  if (p === 'blocks')
    void store.loadBlocks()
}, { immediate: true })
</script>

<template>
  <div class="bp">
    <div class="db-section">
      <div class="db-row">
        <select v-model="kind" class="db-select" :disabled="editing !== '' && editing !== '__new__'">
          <option value="sheet">多维表格</option>
          <option value="board">画板</option>
        </select>
        <button class="db-btn db-btn--primary" @click="startNew">＋ 新建块</button>
      </div>
    </div>

    <div v-if="editing" class="bp__editor">
      <input v-model="title" class="db-input" placeholder="块标题">
      <textarea v-model="payloadText" class="db-textarea bp__json" spellcheck="false" />
      <div v-if="parseError" class="bp__error">{{ parseError }}</div>
      <div class="db-row">
        <button v-if="kind === 'sheet'" class="db-btn" @click="addColumn">＋ 字段</button>
        <button v-if="kind === 'sheet'" class="db-btn" @click="addRow">＋ 行</button>
        <button class="db-btn db-btn--primary" @click="save">保存</button>
        <button class="db-btn" @click="editing = ''">取消</button>
      </div>
    </div>

    <div class="db-list">
      <div v-for="b in store.blocks" :key="b.blockId" class="bp__item">
        <div class="bp__head">
          <span class="db-chip">{{ b.kind }}</span>
          <strong>{{ b.title }}</strong>
          <small>v{{ b.version }}</small>
        </div>
        <div v-if="preview(b)?.columns.length" class="bp__preview">
          <div class="bp__tr bp__tr--head">
            <span v-for="c in preview(b)!.columns" :key="c">{{ c }}</span>
          </div>
          <div v-for="(row, i) in preview(b)!.rows.slice(0, 5)" :key="i" class="bp__tr">
            <span v-for="c in preview(b)!.columns" :key="c">{{ row[c] || '—' }}</span>
          </div>
        </div>
        <pre v-else class="bp__raw">{{ b.payloadJson.slice(0, 240) }}</pre>
        <div class="bp__meta">{{ b.updatedBy }} · {{ b.updatedAt }}</div>
        <div class="db-row">
          <button class="db-btn" @click="startEdit(b)">编辑</button>
          <button class="db-btn db-btn--danger" @click="store.deleteBlock(b.blockId)">删除</button>
        </div>
      </div>
      <div v-if="!store.blocks.length" class="db-empty">暂无富媒体块，可用工具栏插入多维表格 / 画板</div>
    </div>
  </div>
</template>

<style scoped>
.bp__editor { padding: 10px; border-bottom: 1px solid #e8eaed; background: #f7f8fa; }
.bp__json { min-height: 160px; font-family: ui-monospace, Consolas, monospace; font-size: 11px; margin: 6px 0; }
.bp__error { color: #f54a45; font-size: 11px; margin-bottom: 6px; }
.bp__item { padding: 10px 12px; border-bottom: 1px solid #e8eaed; }
.bp__head { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.bp__head strong { flex: 1; }
.bp__head small { color: #8f959e; }
.bp__meta { font-size: 10px; color: #8f959e; margin: 6px 0; }
.bp__raw { margin: 8px 0; padding: 6px; background: #f7f8fa; border-radius: 6px; font-size: 10px; white-space: pre-wrap; word-break: break-all; }
.bp__preview { margin: 8px 0; overflow: auto; border: 1px solid #e8eaed; border-radius: 6px; }
.bp__tr { display: flex; border-top: 1px solid #e8eaed; }
.bp__tr:first-child { border-top: none; }
.bp__tr span { flex: 1; min-width: 60px; padding: 4px 6px; font-size: 10px; border-right: 1px solid #e8eaed; }
.bp__tr--head { background: #f7f8fa; font-weight: 600; }
</style>
