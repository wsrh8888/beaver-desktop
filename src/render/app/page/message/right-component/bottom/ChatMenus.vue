<template>
  <div class="chat-input-area" :style="{ height: `${height}px` }">
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
    />
  </div>
</template>

<script lang="ts">
import { MessageType } from 'commonModule/type/ajax/chat'
import { uploadFileApi } from 'renderModule/api/file'
import chatSender from 'renderModule/app/message-manager/senders/chat-sender'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import { defineComponent, ref } from 'vue'
import { toolList } from './data'
import EmojiComponent from './emoji.vue'

export default defineComponent({
  components: {
    EmojiComponent,
  },
  setup() {
    const _conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()
    const inputValue = ref('')
    const inputRef = ref<HTMLDivElement | null>(null)
    const height = ref(151)
    const showEmoji = ref(false)

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

      try {
        console.error('1231232')
        // 通过Main进程发送消息
        await chatSender.sendMessage(conversationId, content, MessageType.TEXT, 'private')
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
          handleImageSelect()
          break
        // 其他工具处理...
        default:
          break
      }
    }

    // 处理图片选择
    const handleImageSelect = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = false

      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          const file = target.files[0]
          await handleImageUpload(file)
        }
      }

      input.click()
    }

    // 处理图片上传
    const handleImageUpload = async (file: File) => {
      const conversationId = messageViewStore.currentChatId
      if (!conversationId)
        return

      try {
        // 先上传文件到服务器
        const uploadResult = await uploadFileApi(file, file.name)

        // 获取图片尺寸
        const imageDimensions = await getImageDimensions(file)

        // 构建图片消息内容
        const imageContent = {
          fileName: uploadResult.fileName, // 使用服务器返回的真实fileName
          width: imageDimensions.width,
          height: imageDimensions.height,
          size: file.size,
        }

        // 通过Main进程发送图片消息
        // await electron.messageManager.sendMessage(conversationId, imageContent, MessageType.IMAGE)

        console.log('图片消息发送成功:', imageContent)
      }
      catch (error) {
        console.error('发送图片消息失败:', error)
        // 可以在这里添加用户提示
      }
    }

    // 获取图片尺寸
    const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          })
        }
        img.onerror = () => {
          reject(new Error('无法获取图片尺寸'))
        }
        img.src = URL.createObjectURL(file)
      })
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

    // 关闭表情弹窗的方法
    const closeEmojiPopup = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // 检查点击是否在表情弹窗内或表情按钮上
      const isEmojiPopup = !!target.closest('.emoji-popup')
      const isEmojiButton = !!target.closest('.toolbar-btn')
        && target.closest('.toolbar-btn')?.querySelector('img')?.alt === '表情'

      // 只有点击在弹窗和按钮外部时才关闭
      if (!isEmojiPopup && !isEmojiButton && showEmoji.value) {
        showEmoji.value = false
      }
    }

    // 新增 hideEmojiPopup 方法
    const hideEmojiPopup = () => {
      showEmoji.value = false
    }

    return {
      inputValue,
      inputRef,
      handleSend,
      handleInput,
      handleFocus,
      handleBlur,
      handleToolClick,
      toolList,
      height,
      setHeight,
      showEmoji,
      handleEmojiSelect,
      closeEmojiPopup,
      hideEmojiPopup,
      handleImageSelect,
      handleImageUpload,
      getImageDimensions,
    }
  },
})
</script>

<style lang="less" scoped>
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
