<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { IPermItem } from '@packageCommon/type/ajax/doc'
import { deletePermissionApi, listPermissionsApi, setPermissionApi } from '@packageRender/api/doc'
import { ref, watch } from 'vue'

const props = defineProps<{
  resourceType: string // space | doc
  resourceId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const ROLES = ['manager', 'editor', 'commenter', 'viewer']
const perms = ref<IPermItem[]>([])
const newPrincipalId = ref('')
const newRole = ref('viewer')

async function load() {
  if (!props.resourceId)
    return
  const res = await listPermissionsApi({ resourceType: props.resourceType, resourceId: props.resourceId })
  perms.value = res.result?.permissions || []
}

async function addPerm() {
  if (!newPrincipalId.value)
    return
  await setPermissionApi({
    resourceType: props.resourceType,
    resourceId: props.resourceId,
    principalType: 'user',
    principalId: newPrincipalId.value,
    role: newRole.value,
  })
  newPrincipalId.value = ''
  await load()
}

async function removePerm(p: IPermItem) {
  await deletePermissionApi({
    resourceType: p.resourceType,
    resourceId: p.resourceId,
    principalType: p.principalType,
    principalId: p.principalId,
  })
  await load()
}

watch(() => props.resourceId, load)
load()
</script>

<template>
  <div class="share-mask" @click.self="emit('close')">
    <div class="share-dialog">
      <div class="share-dialog__header">
        <span>分享与权限</span>
        <button class="share-dialog__close" @click="emit('close')">×</button>
      </div>

      <div class="share-dialog__add">
        <input v-model="newPrincipalId" placeholder="用户 ID" />
        <select v-model="newRole">
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
        <button @click="addPerm">添加</button>
      </div>

      <ul class="share-dialog__list">
        <li v-for="p in perms" :key="`${p.principalType}:${p.principalId}`" class="share-dialog__item">
          <span>{{ p.principalId }}</span>
          <span class="share-dialog__role">{{ p.role }}</span>
          <button @click="removePerm(p)">移除</button>
        </li>
        <li v-if="!perms.length" class="share-dialog__hint">暂无共享成员</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.share-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.share-dialog {
  width: 420px;
  max-height: 80vh;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.share-dialog__header {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  font-weight: 600;
  border-bottom: 1px solid #ececec;
}
.share-dialog__close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}
.share-dialog__add {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}
.share-dialog__add input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
}
.share-dialog__add select,
.share-dialog__add button {
  padding: 6px 8px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.share-dialog__list {
  list-style: none;
  margin: 0;
  padding: 0 16px 16px;
  overflow: auto;
}
.share-dialog__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.share-dialog__role {
  color: #1a73e8;
  font-size: 12px;
  flex: 1;
}
.share-dialog__hint {
  color: #9aa0a6;
  font-size: 12px;
}
</style>
