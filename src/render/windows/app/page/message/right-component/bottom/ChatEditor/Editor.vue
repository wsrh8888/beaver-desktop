<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  <div class="editor-container">
    <div v-if="mentionOpen && mentionList.length" class="mention-panel">
      <button
        v-for="(member, index) in mentionList"
        :key="member.userId"
        type="button"
        class="mention-item"
        :class="{ active: index === mentionIndex }"
        @mousedown.prevent="pickMention(member)"
      >
        <span class="mention-name">{{ member.nickName || member.userId }}</span>
        <span v-if="member.userType === 3" class="mention-tag">数字伙伴</span>
      </button>
    </div>
    <div class="input-row">
      <div ref="inputRef" class="message-input" contenteditable="true" @input="onInput" @keydown="onKeydown"
        @focus="onFocus" @blur="onBlur" @paste="onPaste" />
      <div v-show="!hasContent" class="placeholder">
        输入消息...
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import { getFilesFromClipboardEvent } from 'renderModule/utils/clipboard'
import { uploadFile } from 'renderModule/utils/upload'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useGroupMemberStore } from 'renderModule/windows/app/pinia/group/group-member'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import type { IGroupMember } from 'commonModule/type/ajax/group'
import { ChatCore } from 'renderModule/core/message/index'
import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { parseEditorDOM } from 'renderModule/utils/message/index'
import { CacheType } from 'commonModule/type/cache/cache'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('ChatEditor')

function messageText(msg: IMessageMsg): string {
  if (msg.textMsg?.content)
    return msg.textMsg.content
  if (msg.replyMsg?.replyMsg?.textMsg?.content)
    return msg.replyMsg.replyMsg.textMsg.content
  return ''
}

function mentionUserIds(text: string, members: { userId: string, nickName: string, status: number }[]) {
  const names = members
    .filter(member => member.status === 1 && member.nickName.trim())
    .sort((a, b) => b.nickName.length - a.nickName.length)
  let rest = text
  const ids: string[] = []
  for (const member of names) {
    const token = `@${member.nickName.trim()}`
    if (!rest.includes(token))
      continue
    ids.push(member.userId)
    rest = rest.split(token).join(' ')
  }
  return ids
}

function mentionQueryAtCaret(root: HTMLElement): string | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed)
    return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.startContainer) || range.startContainer.nodeType !== Node.TEXT_NODE)
    return null
  const before = (range.startContainer.textContent || '').slice(0, range.startOffset)
  const matched = before.match(/@([^\s@]*)$/)
  return matched ? matched[1] : null
}

function formatKeyEvent(event: KeyboardEvent): string | null {
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return null
  }
  const parts: string[] = []
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')
  if (event.metaKey) parts.push('Cmd')
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
  parts.push(key)
  return parts.join('+')
}

export default defineComponent({
  name: 'ChatEditor',
  setup() {
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()
    const groupStore = useGroupStore()
    const groupMemberStore = useGroupMemberStore()
    const userStore = useUserStore()
    const inputRef = ref<HTMLDivElement | null>(null)
    const inputValue = ref('')
    const sendMessageKey = ref('')
    const mentionOpen = ref(false)
    const mentionQuery = ref('')
    const mentionIndex = ref(0)
    const mentionMembers = ref<IGroupMember[]>([])

    const mentionList = computed(() => {
      const keyword = mentionQuery.value.trim().toLowerCase()
      const selfId = userStore.getUserId
      return mentionMembers.value
        .filter((member) => {
          if (member.status !== 1 || member.userId === selfId)
            return false
          if (!keyword)
            return true
          const name = (member.nickName || member.userId).toLowerCase()
          return name.includes(keyword)
        })
        .slice(0, 8)
    })

    const hasContent = computed(() => {
      // 有文字或有图片节点（innerHTML 非空）均视为有内容
      if (inputValue.value.trim().length > 0) return true
      return !!(inputRef.value && inputRef.value.innerHTML.trim().length > 0)
    })

    // 渲染占位图/加载实际图片
    const hydrateImages = async () => {
      if (!inputRef.value) return
      const images = inputRef.value.querySelectorAll('img.editor-media-node') as NodeListOf<HTMLImageElement>
      for (const img of images) {
        if (!img.src || img.src === window.location.href) {
          const fileUrl = img.getAttribute('data-file-url')
          const type = img.getAttribute('data-type')
          if (fileUrl) {
            const cacheType = type === 'emoji' ? CacheType.USER_AVATAR : CacheType.USER_IMAGE
            const localPath = await window.electron.cache.get(cacheType, fileUrl)
            if (localPath) {
              img.src = localPath
            }
          }
        }
      }
    }

    // 监听 Store 草稿变化并同步到 DOM
    watch(() => messageViewStore.getDraft(messageViewStore.currentChatId || '').html, async (newHtml) => {
      if (inputRef.value && inputRef.value.innerHTML !== newHtml) {
        inputRef.value.innerHTML = newHtml || ''
        inputValue.value = inputRef.value.textContent || ''
        await nextTick()
        await hydrateImages()
      }
    })

    const closeMention = () => {
      mentionOpen.value = false
      mentionQuery.value = ''
      mentionIndex.value = 0
    }

    watch(() => messageViewStore.currentChatId, () => {
      closeMention()
    })

    const refreshMention = async () => {
      const conversationId = messageViewStore.currentChatId
      if (!conversationId || !inputRef.value) {
        closeMention()
        return
      }
      const conversationInfo = conversationStore.getConversationInfo(conversationId)
      if (conversationInfo?.chatType !== 2) {
        closeMention()
        return
      }
      const query = mentionQueryAtCaret(inputRef.value)
      if (query === null) {
        closeMention()
        return
      }
      const groupId = groupStore.getGroupIdByConversationId(conversationId)
      if (!groupId) {
        closeMention()
        return
      }
      await groupMemberStore.init(groupId)
      mentionMembers.value = groupMemberStore.getMembersByGroupId(groupId)
      mentionQuery.value = query
      mentionIndex.value = 0
      mentionOpen.value = true
    }

    const pickMention = (member: IGroupMember) => {
      const root = inputRef.value
      const selection = window.getSelection()
      if (!root || !selection || selection.rangeCount === 0)
        return
      const range = selection.getRangeAt(0)
      const node = range.startContainer
      if (node.nodeType !== Node.TEXT_NODE)
        return
      const text = node.textContent || ''
      const before = text.slice(0, range.startOffset)
      const matched = before.match(/@([^\s@]*)$/)
      if (!matched)
        return
      const name = member.nickName || member.userId
      const token = `@${name} `
      const start = range.startOffset - matched[0].length
      node.textContent = text.slice(0, start) + token + text.slice(range.startOffset)
      const next = document.createRange()
      next.setStart(node, start + token.length)
      next.collapse(true)
      selection.removeAllRanges()
      selection.addRange(next)
      closeMention()
      onInput()
    }

    const onInput = () => {
      if (!inputRef.value || !messageViewStore.currentChatId) return
      inputValue.value = inputRef.value.textContent || ''
      messageViewStore.updateDraft(messageViewStore.currentChatId, {
        html: inputRef.value.innerHTML
      })
      void refreshMention()
    }

    const clear = () => {
      inputValue.value = ''
      if (inputRef.value) inputRef.value.innerHTML = ''
      if (messageViewStore.currentChatId) {
        messageViewStore.clearDraft(messageViewStore.currentChatId)
      }
    }

    // 核心发送逻辑
    const sendMixedContent = async () => {
      if (!inputRef.value) return
      const conversationId = messageViewStore.currentChatId
      if (!conversationId) return

      const basicMessages = parseEditorDOM(inputRef.value)
      if (basicMessages.length === 0) return

      const conversationInfo = conversationStore.getConversationInfo(conversationId)
      const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'
      const replyTo = messageViewStore.replyingTo
      let groupMembers: { userId: string, nickName: string, status: number }[] = []
      if (chatType === 'group') {
        const groupId = groupStore.getGroupIdByConversationId(conversationId)
        if (groupId) {
          await groupMemberStore.init(groupId)
          groupMembers = groupMemberStore.getMembersByGroupId(groupId)
        }
      }

      for (let i = 0; i < basicMessages.length; i++) {
        let msg = basicMessages[i]

        if (i === 0 && replyTo) {
          msg = {
            type: MessageType.REPLY,
            replyMsg: {
              originMsgId: replyTo.messageId,
              originMsg: replyTo.msg,
              replyMsg: msg
            }
          }
        }

        if (chatType === 'group') {
          const ids = mentionUserIds(messageText(msg), groupMembers)
          if (ids.length)
            msg = { ...msg, atUserIds: ids }
        }

        await ChatCore.sendMessage(conversationId, msg, chatType)
      }

      if (replyTo) messageViewStore.setReplyingTo(null)
      clear()
    }

    // 统一处理键盘事件
    const onKeydown = async (e: KeyboardEvent) => {
      if (mentionOpen.value && mentionList.value.length) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          mentionIndex.value = (mentionIndex.value + 1) % mentionList.value.length
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          mentionIndex.value = (mentionIndex.value - 1 + mentionList.value.length) % mentionList.value.length
          return
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          pickMention(mentionList.value[mentionIndex.value])
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          closeMention()
          return
        }
      }

      if (formatKeyEvent(e) === sendMessageKey.value) {
        e.preventDefault()
        if (hasContent.value) {
          await sendMixedContent()
        }
        return
      }

      // Backspace：一次删除 contenteditable=false 的图片节点
      if (e.key === 'Backspace' && inputRef.value) {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const range = sel.getRangeAt(0)

        // 仅处理光标（非选区）
        if (!range.collapsed) return

        let target: Node | null = null

        // 情况1：光标在文本节点 offset=0，前一个兄弟是图片节点
        if (range.startOffset === 0) {
          const prev = range.startContainer.previousSibling
          if (prev instanceof HTMLImageElement && prev.classList.contains('editor-media-node')) {
            target = prev
          }
        }

        // 情况2：光标在父节点内，前一个子节点是图片节点
        if (!target) {
          const node = range.startContainer.childNodes[range.startOffset - 1]
          if (node instanceof HTMLImageElement && node.classList.contains('editor-media-node')) {
            target = node
          }
        }

        if (target) {
          e.preventDefault()
          target.parentNode?.removeChild(target)
          if (messageViewStore.currentChatId) {
            messageViewStore.updateDraft(messageViewStore.currentChatId, {
              html: inputRef.value.innerHTML
            })
          }
          onInput()
        }
      }
    }

    const onPaste = async (e: ClipboardEvent) => {
      const files = getFilesFromClipboardEvent(e)
      if (files.length > 0) {
        e.preventDefault()
        try {
          const conversationId = messageViewStore.currentChatId
          if (!conversationId) return

          const conversationInfo = conversationStore.getConversationInfo(conversationId)
          const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'

          for (const file of files) {
            const res = await uploadFile(file)

            // 策略：只有图片进输入框，其他（视频、文件等）全部直接发送
            if (res.type === 'image') {
              messageViewStore.appendMediaToDraft({
                type: res.type,
                fileUrl: res.fileUrl,
                info: {
                  size: res.size,
                  width: res.style?.width,
                  height: res.style?.height,
                  thumbnailUrl: res.thumbnailUrl
                }
              })
            } else {
              const mediaUrl = res.fileUrl
              const msg: IMessageMsg = {
                type: res.type === 'video' ? MessageType.VIDEO
                  : (res.type === 'audio' ? MessageType.AUDIO_FILE : MessageType.FILE),
                videoMsg: res.type === 'video' ? {
                  fileUrl: mediaUrl,
                  width: res.style?.width || 0,
                  height: res.style?.height || 0,
                  duration: res.style?.duration || 0,
                  thumbnailUrl: res.thumbnailUrl
                } : null,
                fileMsg: res.type === 'file' ? {
                  fileUrl: mediaUrl,
                  fileName: res.originalName || 'file',
                  size: res.size || 0,
                  mimeType: ''
                } : null,
                audioFileMsg: res.type === 'audio' ? {
                  fileUrl: mediaUrl,
                  fileName: res.originalName || 'audio',
                  duration: res.style?.duration || 0,
                  size: res.size || 0
                } : null
              }
              await ChatCore.sendMessage(conversationId, msg, chatType)
            }
          }
        } catch (err) {
          logger.error({ text: '粘贴处理失败', data: { error: err } })
        }
      }
    }

    const onFocus = () => {
      messageViewStore.setEmojiShow(false)
    }

    const onBlur = () => { }

    const setContent = (text: string) => {
      if (messageViewStore.currentChatId) {
        messageViewStore.updateDraft(messageViewStore.currentChatId, { html: text })
      }
    }

    const focus = () => {
      inputRef.value?.focus()
    }

    onMounted(async () => {
      const settings = await electron.settings.get()
      sendMessageKey.value = settings.keyboard.sendMessage
      const draft = messageViewStore.getDraft(messageViewStore.currentChatId || '')
      if (inputRef.value) {
        inputRef.value.innerHTML = draft.html || ''
        await nextTick()
        await hydrateImages()
      }
    })

    return {
      inputRef,
      inputValue,
      hasContent,
      mentionOpen,
      mentionList,
      mentionIndex,
      pickMention,
      onInput,
      onKeydown,
      onFocus,
      onBlur,
      onPaste,
      clear,
      focus,
      setContent,
      send: sendMixedContent,
    }
  }
})
</script>

<style lang="less" scoped>
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;

  .mention-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    z-index: 20;
    max-height: 240px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    .mention-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;

      .mention-name {
        font-size: 14px;
        color: #2d3436;
      }

      .mention-tag {
        margin-left: 8px;
        font-size: 12px;
        color: #ff7d45;
      }
    }

    .mention-item.active,
    .mention-item:hover {
      background: #f7f8fa;
    }
  }
}

.input-row {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  overflow: hidden;

  .message-input {
    resize: none;
    width: 100%;
    height: 100%;
    font-size: 14px;
    border: none;
    color: #2D3436;
    border-radius: 6px;
    overflow-y: auto;
    display: block;
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    max-width: 100%;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;

      &:hover {
        background-color: rgba(178, 190, 195, 0.8);
      }
    }

    &:focus {
      outline: none;
      background: #FFFFFF;
    }
  }

  .placeholder {
    position: absolute;
    left: 1px;
    top: 1px;
    color: #B2BEC3;
    pointer-events: none;
    font-size: 14px;
  }
}
</style>
