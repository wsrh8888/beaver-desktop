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
const action = ref('')
const actor = ref('')
const expanded = ref('')

function load() {
  void store.loadAuditLogs({
    action: action.value || undefined,
    actorUserId: actor.value || undefined,
    resourceId: store.currentDocId || undefined,
  })
}

watch(() => store.panel, (p) => {
  if (p === 'audit')
    load()
}, { immediate: true })
</script>

<template>
  <div class="ap">
    <div class="db-section">
      <div class="db-row">
        <input v-model="action" class="db-input" placeholder="动作，如 doc.update_meta" @keydown.enter="load">
      </div>
      <div class="db-row">
        <input v-model="actor" class="db-input" placeholder="操作人 ID" @keydown.enter="load">
        <button class="db-btn db-btn--primary" @click="load">筛选</button>
      </div>
    </div>
    <div class="db-list">
      <div v-for="log in store.auditLogs" :key="log.logId" class="ap__item">
        <div class="ap__head" @click="expanded = expanded === log.logId ? '' : log.logId">
          <span class="db-chip">{{ log.action }}</span>
          <span class="ap__actor">{{ log.actorUserId || '系统' }}</span>
          <small>{{ log.createdAt }}</small>
        </div>
        <div class="ap__target">{{ log.resourceType }} / {{ log.resourceId }}</div>
        <pre v-if="expanded === log.logId" class="ap__detail">{{ log.detail }}</pre>
      </div>
      <div v-if="!store.auditLogs.length" class="db-empty">暂无审计记录</div>
    </div>
  </div>
</template>

<style scoped>
.ap__item { padding: 9px 12px; border-bottom: 1px solid #e8eaed; }
.ap__head { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 11px; }
.ap__actor { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap__head small { color: #8f959e; }
.ap__target { font-size: 10px; color: #8f959e; margin-top: 4px; word-break: break-all; }
.ap__detail {
  margin: 8px 0 0; padding: 8px; background: #f7f8fa; border-radius: 6px;
  font-size: 10px; white-space: pre-wrap; word-break: break-all; max-height: 180px; overflow: auto;
}
</style>
