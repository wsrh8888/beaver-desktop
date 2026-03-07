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
import { selectAndUploadFile, uploadFileFromBase64 } from 'renderModule/utils/upload'

export default defineComponent({
  name: 'Toolbar',
  setup() {
    const messageViewStore = useMessageViewStore()

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
        const acceptMap: Record<string, string | undefined> = {
          image: 'image/*',
          video: 'video/*',
          audio: 'audio/*',
          file: undefined,
        }
        const uploadResults = await selectAndUploadFile(acceptMap[toolType], true)
        for (const res of uploadResults) {
          messageViewStore.appendMediaToDraft({
            type: res.type,
            fileKey: res.fileKey,
            info: {
              size: res.size,
              width: res.style?.width,
              height: res.style?.height,
              duration: res.style?.duration,
              thumbnailKey: res.thumbnailKey
            },
            localUrl: '' // 不再依赖 File 对象预览，由各消息组件渲染逻辑处理或后续优化
          })
        }
      } catch (error) {
        console.error('文件上传失败:', error)
      }
    }

    const handleScreenshot = async () => {
      try {
        const { base64 } = await window.electron.window.captureScreen()
        const uploadResult = await uploadFileFromBase64(base64)
        messageViewStore.appendMediaToDraft({
          type: 'image',
          fileKey: uploadResult.fileKey,
          info: {
            size: uploadResult.size,
            width: uploadResult.style?.width,
            height: uploadResult.style?.height
          },
          localUrl: `data:image/png;base64,${base64}`
        })
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
