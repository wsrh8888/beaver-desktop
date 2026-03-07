<template>
  <div class="editor-container">
    <div class="input-row">
      <div ref="inputRef" class="message-input" contenteditable="true" @input="onInput" @keydown.enter.prevent="onEnter"
        @focus="onFocus" @blur="onBlur" @paste="onPaste" />
      <div v-show="!hasText" class="placeholder">
        输入消息...
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { getFilesFromClipboardEvent } from 'renderModule/utils/clipboard'
import { uploadFile } from 'renderModule/utils/upload'
import { useMessageSenderStore } from 'renderModule/windows/app/pinia/message/message-sender'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'

export default defineComponent({
  name: 'ChatEditor',
  setup() {
    const messageSenderStore = useMessageSenderStore()
    const messageViewStore = useMessageViewStore()
    const inputRef = ref<HTMLDivElement | null>(null)
    const inputValue = ref('')
    const hasText = computed(() => inputValue.value.trim().length > 0)

    // 1. 核心响应式：监听 Store 草稿变化并同步到 DOM
    watch(() => messageViewStore.getDraft(messageViewStore.currentChatId || '').html, (newHtml) => {
      if (inputRef.value && inputRef.value.innerHTML !== newHtml) {
        // 只有当外部修改了 Store（比如点击了表情或工具栏）时才同步 DOM
        inputRef.value.innerHTML = newHtml || ''
        inputValue.value = inputRef.value.textContent || ''
      }
    })

    const onInput = () => {
      if (!inputRef.value || !messageViewStore.currentChatId) return
      inputValue.value = inputRef.value.textContent || ''

      // 用户主动输入时，静默更新 Store，不触发回流同步
      messageViewStore.updateDraft(messageViewStore.currentChatId, {
        html: inputRef.value.innerHTML
      })
    }

    const onEnter = async () => {
      if (hasText.value && inputRef.value) {
        await messageSenderStore.sendMixedContent(inputRef.value)
        clear()
      }
    }

    const onPaste = async (e: ClipboardEvent) => {
      const files = getFilesFromClipboardEvent(e)
      if (files.length > 0) {
        e.preventDefault()
        // 直接处理上传并更新 Store
        try {
          for (const file of files) {
            const res = await uploadFile(file)
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
          }
        } catch (err) {
          console.error('粘贴上传失败:', err)
        }
      }
    }

    const onFocus = () => {
      messageViewStore.setEmojiShow(false)
    }
    const onBlur = () => { }

    const clear = () => {
      inputValue.value = ''
      if (inputRef.value) inputRef.value.innerHTML = ''
      if (messageViewStore.currentChatId) {
        messageViewStore.clearDraft(messageViewStore.currentChatId)
      }
    }

    const setContent = (text: string) => {
      if (messageViewStore.currentChatId) {
        messageViewStore.updateDraft(messageViewStore.currentChatId, { html: text })
      }
    }

    onMounted(() => {
      const draft = messageViewStore.getDraft(messageViewStore.currentChatId || '')
      if (inputRef.value) inputRef.value.innerHTML = draft.html || ''
    })

    return {
      inputRef,
      inputValue,
      hasText,
      onInput,
      onEnter,
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
