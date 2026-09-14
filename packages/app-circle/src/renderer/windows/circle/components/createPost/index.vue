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
  <div class="circle-modal-mask" @click="handleClose">
    <div class="circle-modal" @click.stop>
      <div class="circle-modal-header">
        <h3>发布帖子</h3>
        <button class="circle-modal-close" type="button" @click="handleClose">
          <img src="renderModule/assets/image/header/close.svg" alt="关闭">
        </button>
      </div>

      <div class="circle-modal-body">
        <textarea
          v-model="content"
          class="circle-modal-textarea"
          maxlength="2000"
          placeholder="分享你的想法..."
        />

        <div class="circle-modal-media">
          <div class="circle-modal-media-grid">
            <div
              v-for="(file, index) in mediaFiles"
              :key="file.fileKey + index"
              class="circle-modal-media-item"
            >
              <BeaverImage
                :file-name="file.fileKey"
                alt="图片预览"
                image-class="circle-modal-media-preview"
                @click="handleMediaClick(file)"
              />
              <button class="circle-modal-media-remove" type="button" @click="removeMediaFile(index)">
                <img src="renderModule/assets/image/common/close.svg" alt="删除">
              </button>
            </div>

            <div
              v-if="mediaFiles.length < 9"
              class="circle-modal-media-upload"
              @click="triggerFileSelect"
            >
              <img src="renderModule/assets/image/common/add.svg" alt="添加">
              <span>添加图片</span>
            </div>
          </div>
        </div>
      </div>

      <div class="circle-modal-footer">
        <button class="circle-modal-btn ghost" type="button" @click="handleClose">
          取消
        </button>
        <button
          class="circle-modal-btn primary"
          type="button"
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          发布
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { createPostApi } from 'renderModule/api/circle'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { selectAndUploadFile } from 'renderModule/utils/upload'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('CirclePostModal')

interface MediaFile {
  fileKey: string
  type: number
}

export default defineComponent({
  name: 'CirclePostModal',
  components: { BeaverImage },
  props: {
    circleId: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const content = ref('')
    const mediaFiles = ref<MediaFile[]>([])
    const submitting = ref(false)

    const canSubmit = computed(() => {
      return (content.value.trim().length > 0 || mediaFiles.value.length > 0) && !submitting.value
    })

    const handleClose = () => {
      if (submitting.value)
        return
      emit('close')
    }

    const triggerFileSelect = async () => {
      try {
        const uploadResults = await selectAndUploadFile('image/*', true)
        const newFiles = uploadResults
          .slice(0, 9 - mediaFiles.value.length)
          .map(result => ({
            fileKey: result.fileUrl,
            type: 2,
          }))
          .filter(item => !!item.fileKey)
        mediaFiles.value.push(...newFiles)
      }
      catch (error) {
        logger.error({ text: '文件上传失败', data: { error } })
        Message.error('图片上传失败')
      }
    }

    const removeMediaFile = (index: number) => {
      mediaFiles.value.splice(index, 1)
    }

    const handleMediaClick = async (file: MediaFile) => {
      try {
        const currentIndex = mediaFiles.value.findIndex(item => item.fileKey === file.fileKey)
        await electron.window.openWindow('image', {
          unique: true,
          params: {
            url: file.fileKey,
            list: mediaFiles.value.map(item => item.fileKey),
            index: currentIndex,
          },
        })
      }
      catch (error) {
        logger.error({ text: '打开图片查看器失败', data: { error } })
      }
    }

    const handleSubmit = async () => {
      if (!canSubmit.value || !props.circleId)
        return
      submitting.value = true
      const files = mediaFiles.value.map(item => ({
        fileKey: item.fileKey,
        type: item.type,
      }))
      const res = await createPostApi({
        circleId: props.circleId,
        content: content.value.trim(),
        files: files.length > 0 ? files : undefined,
      })
      submitting.value = false
      if (res.code !== 0) {
        Message.error(res.msg || '发布帖子失败')
        return
      }
      content.value = ''
      mediaFiles.value = []
      emit('success')
      emit('close')
    }

    return {
      content,
      mediaFiles,
      submitting,
      canSubmit,
      handleClose,
      triggerFileSelect,
      removeMediaFile,
      handleMediaClick,
      handleSubmit,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.circle-modal {
  width: 520px;
  max-height: 80vh;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.circle-modal-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }
}

.circle-modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
  }
}

.circle-modal-body {
  padding: 20px;
  overflow-y: auto;
}

.circle-modal-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2D3436;
}

.circle-modal-textarea {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  font-size: 13px;
  color: #2D3436;
  outline: none;
  font-family: inherit;
  min-height: 120px;
  padding: 12px;
  resize: vertical;

  &:focus {
    border-color: #FF7D45;
    box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.12);
  }
}

.circle-modal-media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.circle-modal-media-item,
.circle-modal-media-upload {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.circle-modal-media-item {
  border: 1px solid #EBEEF5;
}

.circle-modal-media-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.circle-modal-media-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  img {
    width: 10px;
    height: 10px;
    filter: brightness(0) invert(1);
  }
}

.circle-modal-media-upload {
  border: 1px dashed #D8DEE6;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #636E72;
  font-size: 12px;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  &:hover {
    border-color: #FF7D45;
    color: #FF7D45;
  }
}

.circle-modal-footer {
  padding: 16px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.circle-modal-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &.ghost {
    border: 1px solid #EBEEF5;
    background: #FFFFFF;
    color: #636E72;
  }

  &.primary {
    border: none;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: #FFFFFF;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
