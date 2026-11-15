<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDocStore } from '../store/doc'

const store = useDocStore()
const category = ref('')
const name = ref('')
const showCreate = ref(false)

function load() {
  void store.loadTemplates(category.value || undefined)
}

async function create() {
  if (!name.value.trim())
    return
  await store.createTemplate(name.value.trim(), JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }))
  name.value = ''
  showCreate.value = false
  load()
}

async function use(templateId: string, title: string) {
  if (!store.currentSpaceId) {
    store.toast('请先选择一个空间')
    return
  }
  await store.useTemplate(templateId, title)
}

watch(() => store.panel, (p) => {
  if (p === 'templates')
    load()
}, { immediate: true })
</script>

<template>
  <div class="tc">
    <div class="db-section">
      <div class="db-row">
        <select v-model="category" class="db-select" @change="load">
          <option value="">全部分类</option>
          <option value="system">官方模板</option>
          <option value="custom">我的模板</option>
        </select>
        <button class="db-btn" @click="showCreate = !showCreate">＋ 新建</button>
      </div>
      <div v-if="showCreate" class="db-row">
        <input v-model="name" class="db-input" placeholder="模板名称" @keydown.enter="create">
        <button class="db-btn db-btn--primary" @click="create">保存</button>
      </div>
    </div>
    <div class="tc__grid">
      <div v-for="t in store.templates" :key="t.templateId" class="tc__card">
        <div class="tc__cover">{{ t.cover ? '🖼' : '▦' }}</div>
        <div class="tc__name">{{ t.name }}</div>
        <div class="tc__desc">{{ t.description || '暂无描述' }}</div>
        <div class="tc__meta">
          <span class="db-chip">{{ t.category }}</span>
          <span>使用 {{ t.useCount }} 次</span>
        </div>
        <div class="tc__actions">
          <button class="db-btn db-btn--primary" @click="use(t.templateId, t.name)">使用</button>
          <button class="db-btn db-btn--danger" @click="store.deleteTemplate(t.templateId).then(load)">删除</button>
        </div>
      </div>
      <div v-if="!store.templates.length" class="db-empty">暂无模板，可把当前文档「存为模板」</div>
    </div>
  </div>
</template>

<style scoped>
.tc__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 10px; }
.tc__card { border: 1px solid #e8eaed; border-radius: 8px; padding: 8px; }
.tc__cover {
  height: 56px; border-radius: 6px; background: #f0f4ff; display: flex;
  align-items: center; justify-content: center; font-size: 22px; margin-bottom: 6px;
}
.tc__name { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc__desc { font-size: 11px; color: #8f959e; min-height: 28px; margin: 4px 0; }
.tc__meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #8f959e; }
.tc__actions { display: flex; gap: 4px; margin-top: 8px; }
.tc__actions .db-btn { flex: 1; padding: 4px 2px; font-size: 11px; }
</style>
