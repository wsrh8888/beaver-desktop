<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IRevisionItem } from '@packageCommon/type/ajax/doc'
import { listRevisionsApi, rollbackRevisionApi } from '@packageRender/api/doc'
import { ref, watch } from 'vue'

const props = defineProps<{
  docId: string
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'rolled-back'): void
}>()

const revisions = ref<IRevisionItem[]>([])
const loading = ref(false)

async function load() {
  if (!props.docId) {
    revisions.value = []
    return
  }
  loading.value = true
  try {
    const res = await listRevisionsApi({ docId: props.docId, page: 1, pageSize: 50 })
    revisions.value = res.result?.revisions || []
  }
  finally {
    loading.value = false
  }
}

async function rollback(rev: IRevisionItem) {
  if (props.readOnly)
    return
  const res = await rollbackRevisionApi({ docId: props.docId, revisionId: rev.revisionId })
  if (res.code === 0) {
    emit('rolled-back')
    await load()
  }
}

watch(() => props.docId, load)
load()
</script>

<template>
  <div class="history-panel">
    <div class="history-panel__header">版本历史</div>
    <ul class="history-panel__list">
      <li v-for="r in revisions" :key="r.revisionId" class="history-panel__item">
        <div class="history-panel__meta">
          <span class="history-panel__ver">v{{ r.version }}</span>
          <span class="history-panel__time">{{ r.createdAt }}</span>
        </div>
        <div v-if="r.label" class="history-panel__label">{{ r.label }}</div>
        <button
          class="history-panel__rollback"
          :disabled="readOnly"
          @click="rollback(r)"
        >
          回滚
        </button>
      </li>
      <li v-if="!loading && !revisions.length" class="history-panel__hint">
        暂无历史版本
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-panel {
  width: 240px;
  height: 100%;
  border-left: 1px solid #ececec;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.history-panel__header {
  padding: 12px;
  font-weight: 600;
  border-bottom: 1px solid #ececec;
}
.history-panel__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow: auto;
}
.history-panel__item {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  margin-bottom: 8px;
}
.history-panel__meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.history-panel__ver {
  font-weight: 600;
  color: #1a73e8;
}
.history-panel__time {
  color: #9aa0a6;
  font-size: 11px;
}
.history-panel__label {
  font-size: 12px;
  color: #444;
  margin: 4px 0;
}
.history-panel__rollback {
  font-size: 12px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  padding: 2px 8px;
}
.history-panel__rollback:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.history-panel__hint {
  color: #9aa0a6;
  font-size: 12px;
}
</style>
