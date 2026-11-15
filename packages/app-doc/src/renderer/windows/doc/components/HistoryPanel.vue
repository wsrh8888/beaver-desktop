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

const props = defineProps<{
  readOnly?: boolean
  baseRevision?: string
  targetRevision?: string
}>()

const emit = defineEmits<{
  (e: 'update:baseRevision', value: string): void
  (e: 'update:targetRevision', value: string): void
  (e: 'compare'): void
  (e: 'rolled-back', revisionId: string): void
}>()

const store = useDocStore()
const labelDraft = ref<Record<string, string>>({})

function load() {
  void store.loadRevisions()
}

async function saveLabel(revisionId: string) {
  const label = labelDraft.value[revisionId]?.trim()
  if (!label)
    return
  await store.labelRevision(revisionId, label)
  load()
}

watch(() => store.currentDocId, load, { immediate: true })
</script>

<template>
  <div class="hp">
    <div class="db-section">
      <div class="db-section__title">版本对比</div>
      <div class="db-row">
        <select
          class="db-select"
          :value="baseRevision"
          @change="emit('update:baseRevision', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">基准版本</option>
          <option v-for="r in store.revisions" :key="r.revisionId" :value="r.revisionId">v{{ r.version }}</option>
        </select>
        <span>→</span>
        <select
          class="db-select"
          :value="targetRevision"
          @change="emit('update:targetRevision', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">目标版本</option>
          <option v-for="r in store.revisions" :key="r.revisionId" :value="r.revisionId">v{{ r.version }}</option>
        </select>
      </div>
      <button class="db-btn db-btn--primary" style="width: 100%" @click="emit('compare')">对比差异</button>
    </div>

    <div class="hp__list">
      <div v-for="r in store.revisions" :key="r.revisionId" class="hp__item">
        <div class="hp__head">
          <strong>v{{ r.version }}</strong>
          <span class="hp__time">{{ r.createdAt }}</span>
        </div>
        <div class="hp__meta">由 {{ r.createdBy || '系统自动保存' }} 生成</div>
        <div v-if="r.label" class="db-chip">{{ r.label }}</div>
        <div class="db-row hp__label-row">
          <input
            v-model="labelDraft[r.revisionId]"
            class="db-input"
            placeholder="命名此版本"
            @keydown.enter="saveLabel(r.revisionId)"
          >
          <button class="db-btn" :disabled="readOnly" @click="saveLabel(r.revisionId)">命名</button>
        </div>
        <div class="hp__actions">
          <button class="db-btn" @click="emit('update:baseRevision', r.revisionId)">设为基准</button>
          <button class="db-btn" @click="emit('update:targetRevision', r.revisionId)">设为目标</button>
          <button class="db-btn db-btn--danger" :disabled="readOnly" @click="emit('rolled-back', r.revisionId)">回滚</button>
        </div>
      </div>
      <div v-if="!store.revisions.length" class="db-empty">暂无历史版本，编辑内容后会自动生成</div>
    </div>
  </div>
</template>

<style scoped>
.hp { display: flex; flex-direction: column; }
.hp__list { padding: 8px 10px; }
.hp__item { border: 1px solid #e8eaed; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
.hp__head { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.hp__time { color: #8f959e; font-size: 11px; }
.hp__meta { color: #8f959e; font-size: 11px; margin: 4px 0 6px; }
.hp__label-row { margin: 8px 0 6px; }
.hp__actions { display: flex; gap: 4px; }
.hp__actions .db-btn { flex: 1; padding: 4px 2px; font-size: 11px; }
</style>
