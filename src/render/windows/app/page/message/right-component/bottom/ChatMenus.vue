<template>
  <div class="chat-input-area-wrapper">
    <div class="resize-handle" @mousedown="startResize" />
    <div ref="chatInputAreaRef" class="chat-input-area" :style="{ height: `${height}px` }">
      <div class="toolbar">
        <div
          v-for="tool in toolList"
          :key="tool.id"
          class="toolbar-btn"
          @click="handleToolClick(tool.value)"
        >
          <img :src="tool.icon" :alt="tool.name">
        </div>
      </div>
      <div class="input-row">
        <div
          ref="inputRef"
          class="message-input"
          contenteditable="true"
          @input="handleInput"
          @keydown.enter.prevent="handleSend"
          @focus="handleFocus"
          @blur="handleBlur"
          @paste="handlePaste"
        />
        <div v-show="!inputValue.trim()" class="placeholder">
          输入消息...
        </div>
      </div>
      <div class="send-row">
        <button class="send-btn" :class="{ disabled: !inputValue.trim() }" @click="handleSend">
          发送
        </button>
      </div>
      <EmojiComponent
        v-if="showEmoji"
        :menu-height="height"
        @select="handleEmojiSelect"
        @close="hideEmojiPopup"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { UploadResult } from 'renderModule/utils/upload'
import { MessageType } from 'commonModule/type/ajax/chat'
import { getFilesFromClipboardEvent } from 'renderModule/utils/clipboard'
import { selectAndUploadFile, uploadFile } from 'renderModule/utils/upload'
import { useMessageSenderStore } from 'renderModule/windows/app/pinia/message/message-sender'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { defineComponent, onBeforeUnmount, ref } from 'vue'
import { toolList } from './data'
import EmojiComponent from './emoji/emoji.vue'

export default defineComponent({
  components: {
    EmojiComponent,
  },
  setup() {
    const messageViewStore = useMessageViewStore()
    const messageSenderStore = useMessageSenderStore()
    const inputValue = ref('')
    const inputRef = ref<HTMLDivElement | null>(null)
    const chatInputAreaRef = ref<HTMLDivElement | null>(null)
    const height = ref(151)
    const showEmoji = ref(false)

    let startY = 0
    let startHeight = 0
    let isResizing = false

    const handleInput = (e: Event) => {
      const target = e.target as HTMLDivElement
      inputValue.value = target.textContent || ''
    }

    const handleFocus = () => {
      if (inputRef.value) {
        inputRef.value.focus()
      }
    }

    const handleBlur = () => {
      if (inputRef.value) {
        inputRef.value.blur()
      }
    }

    // 通用的上传并发送消息函数
    const uploadAndSendMessage = async (uploadResults: UploadResult[]) => {
      const conversationId = messageViewStore.currentChatId
      if (!conversationId || uploadResults.length === 0)
        return

      try {
        // 遍历上传结果，根据文件类型发送对应的消息
        for (const uploadResult of uploadResults) {
          let messageType: MessageType
          let content: any
          console.error('1111111111111111111111', uploadResult)
          // 根据文件类型决定消息类型和内容
          switch (uploadResult.type) {
            case 'image':
              messageType = MessageType.IMAGE
              content = {
                fileKey: uploadResult.fileKey,
                width: uploadResult.style?.width,
                height: uploadResult.style?.height,
                size: uploadResult.size, // 文件大小
              }
              break

            case 'video':
              messageType = MessageType.VIDEO
              content = {
                fileKey: uploadResult.fileKey,
                width: uploadResult.style?.width,
                height: uploadResult.style?.height,
                duration: uploadResult.style?.duration,
                thumbnailKey: uploadResult.thumbnailKey, // 视频封面图
                size: uploadResult.size, // 文件大小
              }
              break

            case 'audio':
              messageType = MessageType.AUDIO_FILE
              content = {
                fileKey: uploadResult.fileKey,
                duration: uploadResult.style?.duration,
                size: uploadResult.size, // 文件大小
              }
              break

            case 'file':
            default:
              messageType = MessageType.FILE
              content = {
                fileKey: uploadResult.fileKey,
                size: uploadResult.size, // 文件大小
              }
              break
          }

          // 发送消息
          await messageSenderStore.sendMessage(conversationId, content, messageType, 'private')
        }
      }
      catch (error) {
        console.error('发送文件消息失败:', error)
        // 可以在这里添加用户提示
      }
    }

    // 处理粘贴事件（支持粘贴文件：图片、视频、音频等）
    const handlePaste = async (e: ClipboardEvent) => {
      const conversationId = messageViewStore.currentChatId
      if (!conversationId)
        return

      // 使用通用工具函数获取剪贴板中的文件
      const files = getFilesFromClipboardEvent(e)

      if (files.length > 0) {
        // 阻止默认粘贴行为（不粘贴文件到输入框）
        e.preventDefault()

        try {
          // 上传所有文件
          const uploadPromises = files.map(file => uploadFile(file))
          const uploadResults = await Promise.all(uploadPromises)

          // 发送消息
          await uploadAndSendMessage(uploadResults)
        }
        catch (error) {
          console.error('粘贴文件上传失败:', error)
          // 可以在这里添加用户提示
        }
      }
      // 如果不是文件，允许默认的文本粘贴行为
    }

    const handleSend = async () => {
      const content = inputValue.value.trim()
      if (!content)
        return

      const conversationId = messageViewStore.currentChatId
      if (!conversationId)
        return

      // 清空输入框
      inputValue.value = ''
      if (inputRef.value) {
        inputRef.value.textContent = ''
      }

      // 通过messageSenderStore发送消息
      try {
        await messageSenderStore.sendMessage(conversationId, content, MessageType.TEXT, 'private')
      }
      catch (error) {
        console.error('发送消息失败:', error)
        // 可以在这里添加错误提示
      }
    }

    const handleToolClick = (toolType: string) => {
      switch (toolType) {
        case 'emoji':
          showEmoji.value = !showEmoji.value
          break
        case 'image':
        case 'file':
          handleFileUpload(toolType)
          break
        // 其他工具处理...
        default:
          break
      }
    }

    // 统一处理文件上传（根据 toolType 传入不同的 accept，然后根据实际上传的文件类型决定消息类型）
    const handleFileUpload = async (toolType: string) => {
      try {
        // 根据 toolType 映射到 accept 参数
        const acceptMap: Record<string, string | undefined> = {
          image: 'image/*',
          video: 'video/*',
          audio: 'audio/*',
          file: undefined, // 不限制类型
        }

        // 统一使用 selectAndUploadFile，传入对应的 accept，返回数组
        const uploadResults = await selectAndUploadFile(acceptMap[toolType])
        console.error('uploadResult11111111111s', uploadResults)
        // 发送消息（复用通用函数）
        await uploadAndSendMessage(uploadResults)
      }
      catch (error) {
        console.error('文件上传失败:', error)
        // 可以在这里添加用户提示
      }
    }

    // 修复后的表情选择处理函数
    const handleEmojiSelect = (emojiName: string) => {
      if (inputRef.value) {
        // 确保输入框获得焦点
        inputRef.value.focus()

        try {
          // 获取当前选区
          const selection = window.getSelection()

          // 检查选区是否存在且有范围
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)

            // 检查范围是否在输入框内
            if (inputRef.value.contains(range.commonAncestorContainer)) {
              // 在光标位置插入表情文本
              const textNode = document.createTextNode(emojiName)
              range.insertNode(textNode)

              // 移动光标到插入的文本之后
              range.setStartAfter(textNode)
              range.setEndAfter(textNode)
              selection.removeAllRanges()
              selection.addRange(range)
            }
            else {
              // 如果选区不在输入框内，追加到末尾
              inputRef.value.textContent += emojiName

              // 移动光标到末尾
              const newRange = document.createRange()
              newRange.selectNodeContents(inputRef.value)
              newRange.collapse(false)
              selection.removeAllRanges()
              selection.addRange(newRange)
            }
          }
          else {
            // 如果没有选区，直接追加到末尾
            inputRef.value.textContent += emojiName

            // 创建一个新的范围并设置到末尾
            const newRange = document.createRange()
            newRange.selectNodeContents(inputRef.value)
            newRange.collapse(false)

            if (selection) {
              selection.removeAllRanges()
              selection.addRange(newRange)
            }
          }

          // 手动触发输入事件，更新inputValue
          const inputEvent = new Event('input', { bubbles: true })
          inputRef.value.dispatchEvent(inputEvent)
        }
        catch (error) {
          console.error('Error inserting emoji:', error)

          // 出错时的备用方案：直接追加
          inputRef.value.textContent += emojiName

          // 手动触发输入事件
          const inputEvent = new Event('input', { bubbles: true })
          inputRef.value.dispatchEvent(inputEvent)
        }
      }
    }

    const setHeight = (newHeight: number) => {
      height.value = newHeight
    }

    // 隐藏表情弹窗
    const hideEmojiPopup = () => {
      showEmoji.value = false
    }

    // 调整高度相关逻辑
    const startResize = (e: MouseEvent) => {
      isResizing = true
      startY = e.clientY
      startHeight = height.value
      // 开始拖动时隐藏表情包详情
      hideEmojiPopup()

      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResize)
    }

    const resize = (e: MouseEvent) => {
      if (!isResizing)
        return

      requestAnimationFrame(() => {
        const deltaY = startY - e.clientY
        const newHeight = Math.max(150, Math.min(300, startHeight + deltaY))
        setHeight(newHeight)
      })
    }

    const stopResize = () => {
      isResizing = false
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    }

    // 在beforeUnmount钩子中移除事件监听
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    })

    return {
      inputValue,
      inputRef,
      chatInputAreaRef,
      handleSend,
      handleInput,
      handleFocus,
      handleBlur,
      handlePaste,
      handleToolClick,
      toolList,
      height,
      setHeight,
      showEmoji,
      handleEmojiSelect,
      hideEmojiPopup,
      handleFileUpload,
      startResize,
    }
  },
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

  .toolbar {
    display: flex;
    align-items: center;
    .toolbar-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: #B2BEC3;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;

      img {
        width: 20px;
        height: 20px;
        transition: transform 0.2s ease;
      }

      &:hover {
        color: #FF7D45;
        background-color: rgba(255, 125, 69, 0.1);
        transform: translateY(-1px);

        img {
          transform: scale(1.1);
        }
      }

      &:active {
        transform: translateY(0);
        background-color: rgba(255, 125, 69, 0.2);
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
      &:hover { background: #FF6B3D; }
      &.disabled { background: #B2BEC3; cursor: not-allowed; }
    }
  }
}
</style>
