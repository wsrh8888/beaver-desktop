<template>
  <div class="publish-modal-overlay" @click="handleOverlayClick">
    <div class="publish-modal" @click.stop>
      <!-- 头部 -->
      <div class="publish-header">
        <h2 class="publish-title">
          发布动态
        </h2>
        <div class="publish-close" @click="$emit('close')">
          <img src="renderModule/assets/image/common/close.svg" alt="关闭">
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="publish-content">
        <!-- 文本输入 -->
        <div class="publish-text-section">
          <textarea v-model="content" placeholder="这一刻的想法..." class="publish-textarea" maxlength="500"
            @input="handleTextInput" />
          <div class="text-counter">
            {{ content.length }}/500
          </div>
        </div>

        <!-- 媒体上传区域 -->
        <div class="publish-media-section">
          <div class="media-grid">
            <!-- 已选择的媒体文件 -->
            <div v-for="(file, index) in mediaFiles" :key="index" class="media-item">
              <!-- 图片预览 -->
              <div class="media-preview-wrapper">
                <BeaverImage :file-name="file.fileKey" alt="图片预览" image-class="media-preview"
                  @click="handleMediaClick(file, index)" />
              </div>

              <button class="media-remove" @click="removeMediaFile(index)">
                <img src="renderModule/assets/image/common/close.svg" alt="删除">
              </button>
            </div>

            <!-- 上传按钮 -->
            <div v-if="mediaFiles.length < 9" class="upload-slot" @click="triggerFileSelect">
              <div class="upload-content">
                <div class="upload-icon">
                  <img src="renderModule/assets/image/common/add.svg" alt="添加">
                </div>
                <div class="upload-text">
                  添加图片
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="publish-footer">
        <BeaverButton size="small" :disabled="isPublishing" @click="$emit('close')">
          取消
        </BeaverButton>
        <BeaverButton type="primary" size="small" :disabled="!canPublish || isPublishing" :loading="isPublishing"
          @click="handlePublish">
          发布
        </BeaverButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ICreateMomentReq } from 'commonModule/type/ajax/moment'
import type { UploadResult } from 'renderModule/utils/upload'
import { previewOnlineFileApi } from 'renderModule/api/file'
import { createMomentApi } from 'renderModule/api/moment'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { selectAndUploadFile } from 'renderModule/utils/upload'
import { useMomentStore } from '../../store/moment/moment'
import { computed, defineComponent, ref } from 'vue'

interface MediaFile {
  fileKey: string
  type: number // 文件类型：1=图片 2=视频 3=音频 4=文件
  name: string
  size?: number
  style?: {
    width?: number
    height?: number
  }
  thumbnailKey?: string
}

export default defineComponent({
  name: 'MomentCreate',
  components: {
    BeaverButton,
    BeaverImage,
  },
  emits: ['close', 'published'],
  setup(props, { emit }) {
    const momentStore = useMomentStore()
    const content = ref('')
    const mediaFiles = ref<MediaFile[]>([])
    const isPublishing = ref(false)

    const canPublish = computed(() => {
      return (content.value.trim().length > 0 || mediaFiles.value.length > 0) && !isPublishing.value
    })

    const handleOverlayClick = () => {
      if (!isPublishing.value) {
        emit('close')
      }
    }

    const handleTextInput = () => {
      // 自动调整高度
      const textarea = document.querySelector('.publish-textarea') as HTMLTextAreaElement
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
      }
    }

    const triggerFileSelect = async () => {
      try {
        // 使用统一的上传工具，只允许图片，支持多选
        const uploadResults = await selectAndUploadFile('image/*', true)

        // 文件类型映射：字符串 -> 数字 (与MsgType保持一致)
        const fileTypeMap = {
          image: 2, // ImageMsgType = 2
          video: 3, // VideoMsgType = 3
          audio: 8, // AudioFileMsgType = 8
          file: 4, // FileMsgType = 4
        }

        // 将上传结果转换为我们需要的格式
        const newFiles = uploadResults
          .slice(0, 9 - mediaFiles.value.length)
          .map(result => ({
            fileKey: result.fileKey,
            type: fileTypeMap[result.type] || 4, // 转换为数字类型
            name: result.originalName || '未知文件',
            size: result.size,
            style: result.style,
            thumbnailKey: result.thumbnailKey,
          }))

        mediaFiles.value.push(...newFiles)
      }
      catch (error) {
        console.error('文件上传失败:', error)
        // 可以在这里添加错误提示
      }
    }

    const removeMediaFile = (index: number) => {
      mediaFiles.value.splice(index, 1)
    }

    // 处理媒体点击
    const handleMediaClick = async (file: MediaFile, _index: number) => {
      // 打开图片查看器

      try {
        const currentIndex = mediaFiles.value.findIndex(f => f === file)
        await electron.window.openWindow('image', {
          unique: true,
          params: {
            url: previewOnlineFileApi(file.fileKey),
            list: mediaFiles.value.map(f => previewOnlineFileApi(f.fileKey)),
            index: currentIndex,
          },
        })
      }
      catch (error) {
        console.error('打开图片查看器失败:', error)
      }
    }

    const handlePublish = async () => {
      if (!canPublish.value)
        return

      isPublishing.value = true

      const publishData: ICreateMomentReq = {
        content: content.value.trim(),
        files: mediaFiles.value.map(f => ({
          fileKey: f.fileKey,
          type: f.type,
        })),
      }

      const result = await createMomentApi(publishData)

      if (result.code === 0) {
        // 直接使用返回的数据添加到列表
        momentStore.addNewMoment(result.result)
        emit('published')
        emit('close')
      }
      isPublishing.value = false
    }

    return {
      content,
      mediaFiles,
      isPublishing,
      canPublish,
      handleOverlayClick,
      handleTextInput,
      triggerFileSelect,
      removeMediaFile,
      handleMediaClick,
      handlePublish,
    }
  },
})
</script>

<style lang="less" scoped>
.publish-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.publish-modal {
  width: 630px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.33, 1, 0.68, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.publish-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(235, 238, 245, 0.8);
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 50%, #FFFFFF 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;

  .publish-title {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    margin: 0;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .publish-close {
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;

    img {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(255, 125, 69, 0.1);
    }
  }
}

.publish-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(249, 250, 251, 0.5);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(178, 190, 195, 0.4);
    border-radius: 3px;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(178, 190, 195, 0.6);
    }
  }
}

.publish-text-section {
  padding-bottom: 20px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%);
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  overflow: hidden;

  .publish-textarea {
    width: 100%;
    min-height: 180px;
    max-height: 240px;
    padding: 10px;
    border: 2px solid rgba(235, 238, 245, 0.6);
    border-radius: 12px;
    color: #2D3436;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(249, 250, 251, 0.5);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(178, 190, 195, 0.4);
      border-radius: 3px;
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(178, 190, 195, 0.6);
      }
    }

    &:focus {
      border-color: #FF7D45;
      background: #FFFFFF;
      // box-shadow:
      //   0 0 0 4px rgba(255, 125, 69, 0.1),
      //   0 8px 32px rgba(255, 125, 69, 0.08);
      // transform: translateY(-1px);
    }

    &::placeholder {
      color: #B2BEC3;
      font-style: italic;
    }
  }

  .text-counter {
    text-align: right;
    font-size: 12px;
    color: #B2BEC3;
    margin-top: 12px;
    font-weight: 500;
  }
}

.publish-media-section {
  .media-grid {
    display: flex;
    justify-content: space-between;
  }

  .media-item {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(235, 238, 245, 0.8);
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    cursor: default;
    padding: 2px;
    box-sizing: border-box;
    border-radius: 5px;

    &:hover {
      border-color: #FF7D45;
      box-shadow: 0 4px 12px rgba(255, 125, 69, 0.1);
    }

    .media-preview-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .media-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }

    .video-container {
      position: relative;
      background-color: #000;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;

      .video-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.3);
        transition: background-color 0.2s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.4);

          .play-button {
            transform: scale(1.1);
          }
        }

        .play-button {
          width: 32px;
          height: 32px;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, background-color 0.2s;

          img {
            width: 16px;
            height: 16px;
            object-fit: contain;
            margin-left: 1px;
            filter: brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(2000%) hue-rotate(350deg) brightness(1.1) contrast(1);
          }

          &:hover {
            background-color: rgba(255, 255, 255, 1);
          }
        }

        .video-duration {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background-color: rgba(0, 0, 0, 0.6);
          color: #fff;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
        }
      }
    }

    .media-remove {
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 20px;
      border: none;
      background: rgba(255, 82, 82, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      &:hover {
        background: #FF5252;
        transform: scale(1.1);
      }

      img {
        width: 12px;
        height: 12px;
        filter: brightness(0) invert(1);
      }
    }

    &:hover .media-remove {
      opacity: 1;
    }
  }

  .upload-slot {
    width: 60px;
    height: 60px;
    border: 2px dashed rgba(255, 125, 69, 0.4);
    border-radius: 5px;
    background: linear-gradient(135deg, rgba(255, 230, 217, 0.3) 0%, rgba(255, 246, 242, 0.5) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    padding: 2px;
    box-sizing: border-box;

    &:hover {
      border-color: #FF7D45;
      background: linear-gradient(135deg, rgba(255, 230, 217, 0.6) 0%, rgba(255, 246, 242, 0.8) 100%);
      box-shadow: 0 4px 12px rgba(255, 125, 69, 0.1);
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .upload-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        opacity: 0.7;
        transition: opacity 0.2s ease;
      }
    }

    .upload-text {
      font-size: 10px;
      color: #FF7D45;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    &:hover .upload-icon img {
      opacity: 1;
    }
  }

  .media-count {
    font-size: 12px;
    color: #B2BEC3;
    text-align: center;
    font-weight: 500;
  }
}

.publish-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(235, 238, 245, 0.8);
  background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}
</style>
