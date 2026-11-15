<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useDocStore } from '../store/doc'

defineProps<{ userId?: string }>()

const store = useDocStore()
const query = ref(store.searchQuery)
const spaceFilter = ref('')
const docType = ref('')

async function doSearch() {
  store.searchQuery = query.value
  await store.search(query.value, spaceFilter.value || undefined)
  if (docType.value) {
    store.searchResults = store.searchResults.filter(i => i.doc?.docType === docType.value)
  }
}
</script>

<template>
  <div class="sp">
    <div class="db-section">
      <div class="db-row">
        <input v-model="query" class="db-input" placeholder="标题 / 正文关键词" @keydown.enter="doSearch">
        <button class="db-btn db-btn--primary" @click="doSearch">搜索</button>
      </div>
      <div class="db-row">
        <select v-model="spaceFilter" class="db-select">
          <option value="">全部空间</option>
          <option v-for="s in store.spaces" :key="s.spaceId" :value="s.spaceId">{{ s.name }}</option>
        </select>
        <select v-model="docType" class="db-select">
          <option value="">全部类型</option>
          <option value="doc">文档</option>
          <option value="sheet">多维表格</option>
          <option value="board">画板</option>
        </select>
      </div>
      <div class="sp__count">命中 {{ store.searchResults.length }} 篇文档</div>
    </div>
    <div class="db-list">
      <div v-for="item in store.searchResults" :key="item.doc?.docId" class="sp__hit" @click="item.doc && store.openDoc(item.doc.docId)">
        <div class="sp__title">{{ item.doc?.icon || '📄' }} {{ item.doc?.title }}</div>
        <div class="sp__snippet">{{ item.snippet || item.doc?.contentText?.slice(0, 80) }}</div>
        <div class="sp__meta">
          <span class="db-chip">v{{ item.doc?.version }}</span>
          <span>{{ item.doc?.updatedAt }}</span>
        </div>
      </div>
      <div v-if="!store.searchResults.length" class="db-empty">输入关键词开始检索</div>
    </div>
  </div>
</template>

<style scoped>
.sp__count { font-size: 11px; color: #8f959e; }
.sp__hit { padding: 10px 12px; border-bottom: 1px solid #e8eaed; cursor: pointer; }
.sp__hit:hover { background: #f7f8fa; }
.sp__title { font-size: 12px; font-weight: 600; }
.sp__snippet { font-size: 11px; color: #646a73; margin: 4px 0; line-height: 1.5; word-break: break-word; }
.sp__meta { display: flex; gap: 8px; align-items: center; font-size: 10px; color: #8f959e; }
</style>
