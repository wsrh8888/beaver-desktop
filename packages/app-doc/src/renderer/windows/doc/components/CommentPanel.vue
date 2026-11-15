<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { ICommentItem } from '@packageCommon/type/ajax/doc'
import { ref, watch } from 'vue'
import { useDocStore } from '../store/doc'

const props = defineProps<{
  readOnly?: boolean
  userId?: string
}>()

const store = useDocStore()
const content = ref('')
const mentions = ref('')
const includeResolved = ref(true)
const replyTo = ref('')
const replyDraft = ref('')

function load() {
  void store.loadComments(includeResolved.value)
}

async function submit() {
  const text = content.value.trim()
  if (!text)
    return
  await store.createComment(text, {
    anchorId: '',
    quote: '',
    mentions: mentions.value.trim(),
  })
  content.value = ''
  mentions.value = ''
  load()
}

async function submitReply(parent: ICommentItem) {
  const text = replyDraft.value.trim()
  if (!text)
    return
  await store.createComment(text, { parentId: parent.commentId })
  replyDraft.value = ''
  replyTo.value = ''
  load()
}

function startReply(item: ICommentItem) {
  replyTo.value = replyTo.value === item.commentId ? '' : item.commentId
  replyDraft.value = ''
}

function mentionList(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

watch(() => [store.currentDocId, includeResolved.value], load, { immediate: true })
</script>

<template>
  <div class="cp">
    <div class="db-section">
      <label class="cp__check">
        <input v-model="includeResolved" type="checkbox">
        显示已解决
      </label>
      <div class="db-section__title">新建评论</div>
      <textarea v-model="content" class="db-textarea" placeholder="输入评论内容…" />
      <input v-model="mentions" class="db-input" placeholder="@提及用户 ID（逗号分隔）">
      <div v-if="mentionList(mentions).length" class="cp__mentions">
        <span v-for="m in mentionList(mentions)" :key="m" class="db-chip">@{{ m }}</span>
      </div>
      <button class="db-btn db-btn--primary cp__submit" :disabled="readOnly || !content.trim()" @click="submit">发表评论</button>
    </div>

    <div class="cp__list">
      <div v-for="c in store.comments" :key="c.commentId" class="cp__card" :class="{ 'is-resolved': c.resolved }">
        <div class="cp__head">
          <strong>{{ c.createdBy || '匿名' }}</strong>
          <span class="cp__time">{{ c.createdAt }}</span>
        </div>
        <div v-if="c.anchorId" class="cp__quote">锚点：{{ c.anchorId }}</div>
        <blockquote v-if="c.quote" class="cp__quote">“{{ c.quote }}”</blockquote>
        <div class="cp__content">{{ c.content }}</div>
        <div v-if="c.mentions" class="cp__mentions">
          <span v-for="m in mentionList(c.mentions)" :key="m" class="db-chip">@{{ m }}</span>
        </div>

        <div v-for="reply in c.replies" :key="reply.commentId" class="cp__reply">
          <strong>{{ reply.createdBy }}</strong>
          <span>{{ reply.content }}</span>
          <small>{{ reply.createdAt }}</small>
        </div>

        <div v-if="replyTo === c.commentId" class="db-row cp__reply-box">
          <input v-model="replyDraft" class="db-input" placeholder="回复…" @keydown.enter="submitReply(c)">
          <button class="db-btn" @click="submitReply(c)">发送</button>
        </div>

        <div class="cp__actions">
          <button class="db-btn" :disabled="readOnly" @click="startReply(c)">回复</button>
          <button class="db-btn" :disabled="readOnly" @click="store.resolveComment(c.commentId, !c.resolved).then(load)">
            {{ c.resolved ? '重新打开' : '标记解决' }}
          </button>
          <button class="db-btn db-btn--danger" :disabled="readOnly" @click="store.deleteComment(c.commentId).then(load)">删除</button>
        </div>
      </div>
      <div v-if="!store.comments.length" class="db-empty">暂无评论，来留下第一条批注吧</div>
    </div>
  </div>
</template>

<style scoped>
.cp { display: flex; flex-direction: column; }
.cp__check { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 8px; }
.cp__check input { width: auto; }
.cp__submit { margin-top: 8px; width: 100%; }
.cp__mentions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.cp__list { padding: 8px 10px; }
.cp__card { border: 1px solid #e8eaed; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
.cp__card.is-resolved { opacity: .6; }
.cp__head { display: flex; justify-content: space-between; font-size: 12px; }
.cp__time { color: #8f959e; font-size: 11px; }
.cp__quote { margin: 6px 0; padding: 4px 8px; border-left: 2px solid #3370ff; background: #f7f8fa; font-size: 11px; color: #8f959e; }
.cp__content { font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.cp__reply { display: flex; gap: 6px; align-items: baseline; margin-top: 8px; padding: 6px 8px; background: #f7f8fa; border-radius: 6px; font-size: 11px; }
.cp__reply span { flex: 1; }
.cp__reply small { color: #8f959e; }
.cp__reply-box { margin-top: 8px; }
.cp__actions { display: flex; gap: 4px; margin-top: 8px; }
.cp__actions .db-btn { flex: 1; padding: 4px 2px; font-size: 11px; }
</style>
