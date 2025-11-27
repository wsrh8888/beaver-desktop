<template>
  <div class="image-viewer">
    <div v-if="imageUrl" class="image-container">
      <img
        :src="imageUrl"
        alt="图片"
        class="viewer-image"
        @load="handleImageLoad"
        @error="handleImageError"
      >
      <div v-if="imageList.length > 1" class="image-nav">
        <button
          class="nav-btn prev-btn"
          :disabled="currentIndex === 0"
          @click="prevImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          class="nav-btn next-btn"
          :disabled="currentIndex === imageList.length - 1"
          @click="nextImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <div v-if="imageList.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ imageList.length }}
      </div>
    </div>
    <div v-else class="empty-state">
      <p>未找到图片</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'ImageViewer',
  props: {
    imageUrl: {
      type: String,
      default: '',
    },
    imageList: {
      type: Array as () => string[],
      default: () => [],
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:currentIndex'],
  setup(props, { emit }) {
    const currentIndex = ref(props.currentIndex)
    const imageUrl = ref(props.imageUrl)
    const isLoading = ref(false)

    watch(() => props.currentIndex, (newVal) => {
      currentIndex.value = newVal
      if (props.imageList.length > 0 && newVal >= 0 && newVal < props.imageList.length) {
        imageUrl.value = props.imageList[newVal]
      }
    })

    watch(() => props.imageUrl, (newVal) => {
      imageUrl.value = newVal
    })

    const prevImage = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        if (props.imageList.length > 0) {
          imageUrl.value = props.imageList[currentIndex.value]
        }
        emit('update:currentIndex', currentIndex.value)
      }
    }

    const nextImage = () => {
      if (props.imageList.length > 0 && currentIndex.value < props.imageList.length - 1) {
        currentIndex.value++
        imageUrl.value = props.imageList[currentIndex.value]
        emit('update:currentIndex', currentIndex.value)
      }
    }

    const handleImageLoad = () => {
      isLoading.value = false
    }

    const handleImageError = () => {
      isLoading.value = false
      console.error('图片加载失败')
    }

    // 键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage()
      }
      else if (e.key === 'ArrowRight') {
        nextImage()
      }
      else if (e.key === 'Escape') {
        electron?.window.closeWindow('image', { hideOnly: true })
      }
    }

    // 监听键盘事件
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })

    return {
      imageUrl,
      currentIndex,
      isLoading,
      prevImage,
      nextImage,
      handleImageLoad,
      handleImageError,
    }
  },
})
</script>

<style lang="less" scoped>
.image-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  transition: opacity 0.3s ease;
}

.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
  pointer-events: none;
}

.nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.image-counter {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.empty-state {
  color: #F0F3F4;
  font-size: 14px;
}
</style>
