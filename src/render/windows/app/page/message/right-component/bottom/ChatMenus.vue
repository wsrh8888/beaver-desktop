<template>
  <div class="chat-input-area-wrapper">
    <!-- 1. 多选操作栏模块 -->
    <MultiActions />

    <!-- 2. 普通输入区域 -->
    <template v-if="!messageViewStore.isMultiSelectMode">
      <div class="resize-handle" @mousedown="startResize" />
      <div ref="chatInputAreaRef" class="chat-input-area" :style="{ height: `${messageViewStore.inputHeight}px` }">

        <!-- 工具栏子组件 -->
        <ChatToolbar />

        <!-- 引用回复预览条 -->
        <ReplyBar />

        <!-- 核心编辑器子组件 -->
        <ChatEditor ref="editorRef" />

        <!-- 发送按钮行 -->
        <div class="send-row">
          <button class="send-btn" :class="{ disabled: !hasTextContent }" @click="triggerEditorSend">
            发送
          </button>
        </div>

        <!-- 表情面板 -->
        <EmojiComponent />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, computed } from 'vue'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'

// 子组件导入
import MultiActions from './ChatActions/MultiActions.vue'
import ChatToolbar from './ChatToolbar/Toolbar.vue'
import ChatEditor from './ChatEditor/Editor.vue'
import ReplyBar from './ChatReply/ReplyBar.vue'
import EmojiComponent from './emoji/emoji.vue'

export default defineComponent({
  name: 'ChatMenus',
  components: {
    MultiActions,
    ChatToolbar,
    ChatEditor,
    ReplyBar,
    EmojiComponent
  },
  setup() {
    const messageViewStore = useMessageViewStore()

    // 状态
    const editorRef = ref<any>(null)
    const chatInputAreaRef = ref<HTMLDivElement | null>(null)

    // 简单的本地状态同步用于发送按钮置灰逻辑
    const hasTextContent = computed(() => editorRef.value?.hasText || false)

    const triggerEditorSend = () => {
      editorRef.value?.onEnter()
    }

    // 高度调整逻辑
    let startY = 0
    let startHeight = 0
    let isResizing = false

    const startResize = (e: MouseEvent) => {
      isResizing = true
      startY = e.clientY
      startHeight = messageViewStore.inputHeight
      messageViewStore.setEmojiShow(false)
      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResize)
    }

    const resize = (e: MouseEvent) => {
      if (!isResizing) return
      requestAnimationFrame(() => {
        const deltaY = startY - e.clientY
        const newHeight = Math.max(150, Math.min(300, startHeight + deltaY))
        messageViewStore.setInputHeight(newHeight)
      })
    }

    const stopResize = () => {
      isResizing = false
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    })

    return {
      messageViewStore,
      editorRef,
      chatInputAreaRef,
      hasTextContent,
      triggerEditorSend,
      startResize,
    }
  }
})
</script>

<style lang="less" scoped>
.chat-input-area-wrapper {
  position: relative;
}

.resize-handle {
  height: 2px;
  background-color: #EBEEF5;
  cursor: ns-resize;
  transition: background-color 0.2s;
  will-change: background-color;
  user-select: none;

  &:hover {
    background-color: #D1D9E0;
  }
}

.chat-input-area {
  background-color: #FFFFFF;
  border-top: 1px solid #EBEEF5;
  padding: 5px 24px 10px;
  display: flex;
  flex-direction: column;
  will-change: height;
  transform: translateZ(0);
  transition: height 0.1s ease;
  min-height: 150px;

  .send-row {
    text-align: right;
    margin-top: 4px;

    .send-btn {
      padding: 8px 24px;
      background: #FF7D45;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        background: #FF6B3D;
      }

      &.disabled {
        background: #B2BEC3;
        cursor: not-allowed;
      }
    }
  }
}
</style>
