<template>
  <div class="image__content">
    <!-- 标题栏 -->
    <div class="titlebar">
      <div class="title">
        图片查看
      </div>
      <button class="close-btn" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="image__main">
      <ImageViewer :image-url="imageUrl" :image-list="imageList" :current-index="currentIndex" />
    </div>
  </div>
</template>

<script lang="ts">
import { NotificationModule } from 'commonModule/type/preload/notification'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import ImageViewer from './views/index.vue'

export default defineComponent({
  components: {
    ImageViewer,
  },
  setup() {
    const imageUrl = ref('')
    const imageList = ref<string[]>([])
    const currentIndex = ref(0)

    const handleClose = () => {
      electron?.window.closeWindow('image', { hideOnly: true })
    }

    // 更新图片内容
    const updateImage = (data: { url?: string, list?: string[], index?: number }) => {
      if (data.url) {
        imageUrl.value = data.url
      }
      if (data.list) {
        imageList.value = data.list
      }
      if (data.index !== undefined) {
        currentIndex.value = data.index
      }
    }

    // 从 URL 参数获取图片信息
    const loadFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const url = urlParams.get('url')
      const list = urlParams.get('list')
      const index = urlParams.get('index')

      if (url) {
        imageUrl.value = decodeURIComponent(url)
      }
      if (list) {
        imageList.value = JSON.parse(decodeURIComponent(list))
      }
      if (index) {
        currentIndex.value = Number.parseInt(index, 10)
      }
    }

    // 监听notification更新
    const handleNotification = (payload: any) => {
      if (payload.command === 'updateImage' && payload.data) {
        updateImage(payload.data)
      }
    }

    onMounted(() => {
      loadFromUrl()
      // 监听notification
      electron?.notification.on(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    onUnmounted(() => {
      electron?.notification.off(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    return {
      imageUrl,
      imageList,
      currentIndex,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.image__content {
  width: 100%;
  height: 100vh;
  background: #1E2022;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: drag;
}

/* 标题栏 */
.titlebar {
  height: 40px;
  background-color: rgba(30, 32, 34, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-app-region: drag;
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #F0F3F4;
    -webkit-app-region: drag;
  }

  .close-btn {
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      filter: brightness(0) invert(1);
    }

    &:hover img {
      opacity: 1;
    }
  }
}

// 主要内容区域
.image__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
