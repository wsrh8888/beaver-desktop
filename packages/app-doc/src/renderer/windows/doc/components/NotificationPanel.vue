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
const unreadOnly = ref(false)

function load() {
  void store.loadNotifications(unreadOnly.value)
}

function open(item: { docId: string, notificationId: string }) {
  void store.markRead(item.notificationId)
  if (item.docId)
    void store.openDoc(item.docId)
}

watch(() => [store.panel, unreadOnly.value], () => {
  if (store.panel === 'notifications')
    load()
}, { immediate: true })
</script>

<template>
  <div class="np">
    <div class="db-section db-row">
      <label class="np__check"><input v-model="unreadOnly" type="checkbox"> 仅未读</label>
      <span class="np__count">未读 {{ store.unread }}</span>
      <button class="db-btn" @click="store.markRead(undefined, true).then(load)">全部已读</button>
    </div>
    <div class="db-list">
      <div
        v-for="n in store.notifications"
        :key="n.notificationId"
        class="np__item"
        :class="{ 'is-unread': !n.isRead }"
        @click="open(n)"
      >
        <div class="np__title">
          <span class="db-chip">{{ n.kind }}</span>
          <strong>{{ n.title }}</strong>
        </div>
        <div class="np__excerpt">{{ n.excerpt }}</div>
        <div class="np__meta">{{ n.actorUserId }} · {{ n.createdAt }}</div>
      </div>
      <div v-if="!store.notifications.length" class="db-empty">暂无通知</div>
    </div>
  </div>
</template>

<style scoped>
.np__check { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.np__check input { width: auto; }
.np__count { flex: 1; font-size: 11px; color: #8f959e; }
.np__item { padding: 10px 12px; border-bottom: 1px solid #e8eaed; cursor: pointer; }
.np__item:hover { background: #f7f8fa; }
.np__item.is-unread { border-left: 3px solid #3370ff; }
.np__title { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.np__excerpt { font-size: 11px; color: #646a73; margin: 5px 0; }
.np__meta { font-size: 10px; color: #8f959e; }
</style>
