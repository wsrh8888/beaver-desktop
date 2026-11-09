<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IDocPresence } from '@packageCommon/type/ajax/doc'

defineProps<{
  presence: IDocPresence[]
  connected: boolean
}>()
</script>

<template>
  <div class="presence-bar">
    <span class="presence-bar__dot" :class="connected ? 'is-on' : 'is-off'" />
    <span class="presence-bar__label">{{ connected ? '已连接' : '连接中…' }}</span>
    <div class="presence-bar__users">
      <span
        v-for="u in presence"
        :key="u.clientId"
        class="presence-bar__avatar"
        :style="{ background: u.color }"
        :title="u.name"
      >{{ (u.name || '?').slice(0, 1) }}</span>
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
}
.presence-bar__dot.is-on {
  background: #10b981;
}
.presence-bar__dot.is-off {
  background: #f59e0b;
}
.presence-bar__label {
  font-size: 12px;
  color: #6b7280;
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
}
</style>
