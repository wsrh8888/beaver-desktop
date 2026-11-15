<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import { watch } from 'vue'
import { useDocStore } from '../store/doc'

const store = useDocStore()

function load() {
  void store.loadTrash()
}

async function empty() {
  if (!window.confirm('确定清空回收站？该操作不可恢复。'))
    return
  await store.emptyTrash()
}

async function purge(trashId: string) {
  if (!window.confirm('确定彻底删除？该操作不可恢复。'))
    return
  await store.purgeTrash(trashId)
}

watch(() => store.panel, (p) => {
  if (p === 'trash')
    load()
}, { immediate: true })
</script>

<template>
  <div class="tp">
    <div class="db-section db-row">
      <span class="tp__count">共 {{ store.trash.length }} 项</span>
      <button class="db-btn db-btn--danger" @click="empty">清空回收站</button>
    </div>
    <div class="db-list">
      <div v-for="t in store.trash" :key="t.trashId" class="tp__item">
        <div class="db-item">
          <span>{{ t.resourceType === 'doc' ? '📄' : t.resourceType === 'space' ? '📚' : '📁' }} {{ t.title }}</span>
          <small>{{ t.deletedAt }}</small>
        </div>
        <div class="tp__ops">
          <span class="db-chip">{{ t.resourceType }}</span>
          <span class="tp__by">{{ t.deletedBy }}</span>
          <button class="db-btn" @click="store.restoreTrash(t.trashId)">恢复</button>
          <button class="db-btn db-btn--danger" @click="purge(t.trashId)">彻底删除</button>
        </div>
      </div>
      <div v-if="!store.trash.length" class="db-empty">回收站是空的</div>
    </div>
  </div>
</template>

<style scoped>
.tp__count { flex: 1; font-size: 12px; color: #8f959e; }
.tp__item { border-bottom: 1px solid #e8eaed; }
.tp__ops { display: flex; align-items: center; gap: 6px; padding: 0 10px 8px; }
.tp__by { flex: 1; font-size: 10px; color: #8f959e; }
.tp__ops .db-btn { font-size: 11px; padding: 3px 8px; }
</style>
