<template>
  <div class="toolbar">
    <div v-for="tool in toolList" :key="tool.id" class="toolbar-btn" :title="tool.name"
      @click="handleToolClick(tool.value)">
      <img :src="tool.icon" :alt="tool.name">
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { toolList } from '../data'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'
import { ChatCore } from 'renderModule/core/message/index'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { selectAndUploadFile, uploadFileFromBase64 } from 'renderModule/utils/upload'
import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'

export default defineComponent({
  name: 'Toolbar',
  setup() {
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()

    const handleToolClick = async (toolType: string) => {
      switch (toolType) {
        case 'emoji':
          messageViewStore.setEmojiShow(!messageViewStore.showEmoji)
          break
        case 'image':
        case 'file':
        case 'video':
          await handleFileUpload(toolType)
          break
        case 'screenshot':
          await handleScreenshot()
          break
      }
    }

    const handleFileUpload = async (toolType: string) => {
      try {
        const conversationId = messageViewStore.currentChatId
        if (!conversationId) return

        const acceptMap: Record<string, string | undefined> = {
          image: 'image/*',
          video: 'video/*',
          audio: 'audio/*',
          file: undefined,
        }
        const uploadResults = await selectAndUploadFile(acceptMap[toolType], true)

        const conversationInfo = conversationStore.getConversationInfo(conversationId)
        const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'

        for (const res of uploadResults) {
          const msg: IMessageMsg = {
            type: res.type === 'image' ? MessageType.IMAGE : (res.type === 'video' ? MessageType.VIDEO : (res.type === 'audio' ? MessageType.AUDIO_FILE : MessageType.FILE)),
            imageMsg: res.type === 'image' ? {
              fileKey: res.fileKey,
              width: res.style?.width || 0,
              height: res.style?.height || 0
            } : null,
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
      } catch (error) {
        console.error('文件上传失败:', error)
      }
    }

    const handleScreenshot = async () => {
      try {
        const conversationId = messageViewStore.currentChatId
        if (!conversationId) return

        const { base64 } = await window.electron.window.captureScreen()
        const uploadResult = await uploadFileFromBase64(base64)

        const conversationInfo = conversationStore.getConversationInfo(conversationId)
        const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'

        const msg: IMessageMsg = {
          type: MessageType.IMAGE,
          imageMsg: {
            fileKey: uploadResult.fileKey,
            width: uploadResult.style?.width || 0,
            height: uploadResult.style?.height || 0
          }
        }
        await ChatCore.sendMessage(conversationId, msg, chatType)
      } catch (error) {
        console.error('截屏失败:', error)
      }
    }

    return {
      toolList,
      handleToolClick
    }
  }
})
</script>

<style lang="less" scoped>
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
</style>
