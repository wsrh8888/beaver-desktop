<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import type { DocSyncStatus } from '../composables/useDocProvider'
import { computed } from 'vue'

const props = defineProps<{
  presence: IDocPresence[]
  connected: boolean
  /** 协同会话细分状态，优先于 connected 展示。 */
  status?: DocSyncStatus
  /** 离线期间未同步的本地变更数量。 */
  pending?: number
}>()

const LABELS: Record<DocSyncStatus, string> = {
  connecting: '连接中…',
  connected: '已连接',
  synced: '已同步',
  disconnected: '已断开',
  reconnecting: '重连中…',
  offline: '离线编辑',
  epochChanged: '版本已更新，正在重建…',
  error: '同步异常',
}

const label = computed(() => {
  if (props.status && props.status !== 'connected' && props.status !== 'synced')
    return LABELS[props.status]
  if (props.pending && props.pending > 0)
    return `${props.pending} 项待同步`
  return props.status ? LABELS[props.status] : (props.connected ? '已连接' : '连接中…')
})

const state = computed<'on' | 'off' | 'warn'>(() => {
  const s = props.status
  if (s === 'synced' || s === 'connected')
    return 'on'
  if (s === 'error' || s === 'epochChanged')
    return 'warn'
  if (s === 'offline' || s === 'reconnecting' || s === 'disconnected')
    return 'warn'
  return props.connected ? 'on' : 'off'
})

const others = computed(() => props.presence.slice(0, 6))
</script>

<template>
  <div class="presence-bar" :title="status || ''">
    <span class="presence-bar__dot" :class="`is-${state}`" />
    <span class="presence-bar__label">{{ label }}</span>
    <div class="presence-bar__users">
      <span
        v-for="u in others"
        :key="u.clientId"
        class="presence-bar__avatar"
        :class="{ 'is-readonly': u.readOnly }"
        :style="{ background: u.color }"
        :title="`${u.name}${u.readOnly ? '（只读）' : ''}`"
      >{{ (u.name || '?').slice(0, 1) }}</span>
      <span v-if="presence.length > others.length" class="presence-bar__avatar is-more">
        +{{ presence.length - others.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.presence-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.presence-bar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.presence-bar__dot.is-on {
  background: #10b981;
}
.presence-bar__dot.is-off {
  background: #f59e0b;
}
.presence-bar__dot.is-warn {
  background: #f54a45;
}
.presence-bar__label {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}
.presence-bar__users {
  display: flex;
  margin-left: 8px;
}
.presence-bar__avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -6px;
  border: 2px solid #fff;
  flex: none;
}
.presence-bar__avatar.is-readonly {
  opacity: .55;
}
.presence-bar__avatar.is-more {
  background: #e8eaed;
  color: #6b7280;
  font-size: 10px;
}
</style>
