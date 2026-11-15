<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDocStore } from '../store/doc'

const emit = defineEmits<{ (e: 'close'): void }>()

const store = useDocStore()
const tab = ref<'members' | 'link'>('members')
const principalId = ref('')
const newRole = ref('viewer')
const copied = ref(false)

const scope = ref('anyone')
const linkRole = ref('viewer')
const password = ref('')
const expiresAt = ref('')
const allowDownload = ref(true)
const allowCopy = ref(true)
const allowComment = ref(false)
const watermark = ref(false)

onMounted(async () => {
  await Promise.all([store.loadPermissions(), store.loadCollaborators(), store.loadShareLink()])
  const link = store.shareLink
  if (link) {
    scope.value = link.scope || 'anyone'
    linkRole.value = link.role || 'viewer'
    expiresAt.value = link.expiresAt || ''
    allowDownload.value = link.allowDownload
    allowCopy.value = link.allowCopy
    allowComment.value = link.allowComment
    watermark.value = link.watermark
  }
})

async function addPerm() {
  if (!principalId.value.trim())
    return
  await store.addPermission(principalId.value.trim(), newRole.value)
  principalId.value = ''
}

async function saveLink() {
  await store.saveShareLink({
    scope: scope.value,
    role: linkRole.value,
    password: password.value || undefined,
    expiresAt: expiresAt.value || undefined,
    allowDownload: allowDownload.value,
    allowCopy: allowCopy.value,
    allowComment: allowComment.value,
    watermark: watermark.value,
  })
  password.value = ''
}

async function copyLink() {
  if (!store.shareLink?.url)
    return
  try {
    await navigator.clipboard.writeText(store.shareLink.url)
    copied.value = true
    window.setTimeout(() => copied.value = false, 1800)
  }
  catch { /* 剪贴板不可用时忽略 */ }
}
</script>

<template>
  <div class="db-mask" @click.self="emit('close')">
    <div class="db-dialog share">
      <div class="db-dialog__head">
        <strong>分享与协作权限</strong>
        <button class="db-btn db-btn--ghost" @click="emit('close')">×</button>
      </div>

      <div class="share__tabs">
        <button :class="{ 'is-active': tab === 'members' }" @click="tab = 'members'">成员权限</button>
        <button :class="{ 'is-active': tab === 'link' }" @click="tab = 'link'">分享链接</button>
      </div>

      <div class="db-dialog__body">
        <template v-if="tab === 'members'">
          <div class="db-section__title">添加协作者</div>
          <div class="db-row">
            <input v-model="principalId" class="db-input" placeholder="用户 ID" @keydown.enter="addPerm">
            <select v-model="newRole" class="db-select" style="width: 96px">
              <option value="manager">管理者</option>
              <option value="editor">可编辑</option>
              <option value="commenter">可评论</option>
              <option value="viewer">可阅读</option>
            </select>
            <button class="db-btn db-btn--primary" @click="addPerm">添加</button>
          </div>

          <div class="db-section__title" style="margin-top: 14px">显式授权</div>
          <div class="db-list">
            <div v-for="p in store.permissions" :key="`${p.principalType}:${p.principalId}`" class="db-item">
              <span>{{ p.principalId }}</span>
              <span class="db-chip">{{ p.role }}</span>
              <button class="db-btn db-btn--danger" @click="store.removePermission(p)">移除</button>
            </div>
            <div v-if="!store.permissions.length" class="db-empty">暂无显式授权成员</div>
          </div>

          <div class="db-section__title" style="margin-top: 14px">有效协作者（含归属人与空间继承）</div>
          <div class="db-list">
            <div v-for="c in store.collaborators" :key="`${c.userId}:${c.source}`" class="db-item">
              <span>{{ c.userId }}</span>
              <span class="db-chip">{{ c.role }}</span>
              <small>{{ c.source }}</small>
            </div>
            <div v-if="!store.collaborators.length" class="db-empty">暂无协作者</div>
          </div>
        </template>

        <template v-else>
          <div class="db-row">
            <label class="share__label">可见范围</label>
            <select v-model="scope" class="db-select">
              <option value="anyone">任何人（有链接）</option>
              <option value="org">组织内成员</option>
              <option value="invited">仅受邀成员</option>
            </select>
          </div>
          <div class="db-row">
            <label class="share__label">链接权限</label>
            <select v-model="linkRole" class="db-select">
              <option value="viewer">可阅读</option>
              <option value="commenter">可评论</option>
              <option value="editor">可编辑</option>
            </select>
          </div>
          <div class="db-row">
            <label class="share__label">访问密码</label>
            <input v-model="password" class="db-input" type="password" placeholder="留空表示不设密码">
          </div>
          <div class="db-row">
            <label class="share__label">过期时间</label>
            <input v-model="expiresAt" class="db-input" placeholder="2006-01-02 15:04:05（留空长期有效）">
          </div>
          <div class="share__switches">
            <label><input v-model="allowDownload" type="checkbox"> 允许下载</label>
            <label><input v-model="allowCopy" type="checkbox"> 允许复制</label>
            <label><input v-model="allowComment" type="checkbox"> 允许评论</label>
            <label><input v-model="watermark" type="checkbox"> 显示水印</label>
          </div>

          <button class="db-btn db-btn--primary" style="width: 100%; margin-top: 12px" @click="saveLink">
            {{ store.shareLink ? '更新链接设置' : '生成分享链接' }}
          </button>

          <div v-if="store.shareLink" class="share__link">
            <input class="db-input" :value="store.shareLink.url" readonly>
            <button class="db-btn" @click="copyLink">{{ copied ? '已复制' : '复制' }}</button>
            <button class="db-btn db-btn--danger" @click="store.revokeShareLink()">撤销</button>
          </div>
          <div v-if="store.shareLink" class="share__stat">
            访问 {{ store.shareLink.viewCount }} 次 ·
            {{ store.shareLink.hasPassword ? '已设密码' : '无密码' }} ·
            {{ store.shareLink.expiresAt || '长期有效' }}
          </div>
        </template>
      </div>

      <div class="db-dialog__foot">
        <button class="db-btn" @click="emit('close')">完成</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.share { width: 520px; }
.share__tabs { display: flex; gap: 4px; padding: 8px 12px 0; border-bottom: 1px solid #e8eaed; }
.share__tabs button {
  padding: 6px 12px; font-size: 12px; border: none; background: transparent;
  border-bottom: 2px solid transparent; cursor: pointer;
}
.share__tabs button.is-active { color: #3370ff; border-bottom-color: #3370ff; font-weight: 600; }
.share__label { width: 72px; flex: none; font-size: 12px; color: #8f959e; }
.share__switches { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 10px; font-size: 12px; }
.share__switches label { display: flex; align-items: center; gap: 5px; }
.share__switches input { width: auto; }
.share__link { display: flex; gap: 6px; margin-top: 12px; }
.share__stat { margin-top: 8px; font-size: 11px; color: #8f959e; }
</style>
