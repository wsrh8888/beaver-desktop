<template>
  <div class="file-message" @click.stop="handleOpen">
    <div class="file-icon">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          fill="#2196F3"
        />
        <path d="M14 2v6h6" fill="#64B5F6" />
      </svg>
    </div>
    <div class="file-info">
      <div class="file-name" :title="fileName">
        {{ fileName }}
      </div>
      <div v-if="fileSize" class="file-size">
        {{ formatFileSize(fileSize) }}
      </div>
    </div>
    <div class="file-action" @click.stop="handleDownload">
      <img :src="downloadSvg" alt="下载">
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import downloadSvg from 'renderModule/assets/image/chat/download.svg'
import Message from 'renderModule/components/ui/message'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'FileMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    const fileName = computed(() => {
      return props.msg.fileMsg?.fileName || '未知文件'
    })

    const fileSize = computed(() => {
      return props.msg.fileMsg?.size || null
    })

    const fileUrl = computed(() => props.msg.fileMsg?.fileUrl || '')

    const formatFileSize = (bytes: number | null | undefined): string => {
      if (!bytes || bytes === 0)
        return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
    }

    const handleOpen = async () => {
      if (!fileUrl.value) {
        Message.error('无法获取文件地址')
        return
      }

      const localPath = await electron.cache.open(CacheType.USER_IMAGE, fileUrl.value)
      if (!localPath) {
        Message.error('文件打开失败')
      }
    }

    const handleDownload = async () => {
      if (!fileUrl.value) {
        Message.error('无法获取文件地址')
        return
      }

      const filename = props.msg.fileMsg?.fileName || getFileNameFromUrl(fileUrl.value) || 'file'
      try {
        const response = await fetch(fileUrl.value)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        Message.success('已开始下载')
      }
      catch {
        Message.error('下载失败')
      }
    }

    return {
      fileName,
      fileSize,
      formatFileSize,
      handleOpen,
      handleDownload,
      downloadSvg,
    }
  },
})
</script>

<style lang="less" scoped>
.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  max-width: 280px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .file-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: #2D3436;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }

    .file-size {
      font-size: 12px;
      color: #909399;
    }
  }

  .file-action {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;

    img {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
