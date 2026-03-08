<template>
  <div class="editor-container">
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
import { ChatCore } from 'renderModule/core/message/index'
import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { parseEditorDOM } from 'renderModule/utils/message/index'
import { CacheType } from 'commonModule/type/cache/cache'

export default defineComponent({
  name: 'ChatEditor',
  setup() {
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()
    const inputRef = ref<HTMLDivElement | null>(null)
    const inputValue = ref('')

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
          const fileKey = img.getAttribute('data-file-key')
          const type = img.getAttribute('data-type')
          if (fileKey) {
            const cacheType = type === 'emoji' ? CacheType.USER_AVATAR : CacheType.USER_IMAGE
            const localPath = await window.electron.cache.get(cacheType, fileKey)
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

    const onInput = () => {
      if (!inputRef.value || !messageViewStore.currentChatId) return
      inputValue.value = inputRef.value.textContent || ''
      messageViewStore.updateDraft(messageViewStore.currentChatId, {
        html: inputRef.value.innerHTML
      })
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

      const conversationInfo = conversationStore.getConversationInfo(conversationId)
      const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'

      const basicMessages = parseEditorDOM(inputRef.value)
      if (basicMessages.length === 0) return

      const replyTo = messageViewStore.replyingTo

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

        await ChatCore.sendMessage(conversationId, msg, chatType)
      }

      if (replyTo) messageViewStore.setReplyingTo(null)
      clear()
    }

    // 统一处理键盘事件
    const onKeydown = async (e: KeyboardEvent) => {
      // Enter：发送消息
      if (e.key === 'Enter') {
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
                fileKey: res.fileKey,
                info: {
                  size: res.size,
                  width: res.style?.width,
                  height: res.style?.height,
                  thumbnailKey: res.thumbnailKey
                }
              })
            } else {
              const msg: IMessageMsg = {
                type: res.type === 'video' ? MessageType.VIDEO
                  : (res.type === 'audio' ? MessageType.AUDIO_FILE : MessageType.FILE),
                videoMsg: res.type === 'video' ? {
                  fileKey: res.fileKey,
                  width: res.style?.width || 0,
                  height: res.style?.height || 0,
                  duration: res.style?.duration || 0
                } : null,
                fileMsg: res.type === 'file' ? {
                  fileKey: res.fileKey,
                  fileName: res.originalName || 'file',
                  size: res.size || 0,
                  mimeType: ''
                } : null,
                audioFileMsg: res.type === 'audio' ? {
                  fileKey: res.fileKey,
                  fileName: res.originalName || 'audio',
                  duration: res.style?.duration || 0,
                  size: res.size || 0
                } : null
              }
              await ChatCore.sendMessage(conversationId, msg, chatType)
            }
          }
        } catch (err) {
          console.error('粘贴处理失败:', err)
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
      onInput,
      onKeydown,
      onFocus,
      onBlur,
      onPaste,
      clear,
      focus,
      setContent
    }
  }
})
</script>

<style lang="less" scoped>
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
