<template>
  <img
    v-if="imageSrc"
    :src="imageSrc"
    :class="imageClass"
    :style="imageStyle"
    :alt="alt"
    :loading="lazyLoad ? 'lazy' : 'eager'"
    @load="handleLoad"
    @error="handleError"
    @click="handleClick"
  >
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { CacheType } from 'commonModule/type/cache/cache'
import { ref, watch } from 'vue'

export default {
  name: 'BeaverImage',
  props: {
    // 文件名（用于获取在线文件）
    fileName: {
      type: String,
      required: true,
    },
    // 缓存类型
    cacheType: {
      type: String as PropType<CacheType>,
      default: CacheType.USER_AVATAR,
    },
    // 图片模式
    mode: {
      type: String,
      default: 'aspectFill',
    },
    // 是否懒加载
    lazyLoad: {
      type: Boolean,
      default: true,
    },
    // 图片类名
    imageClass: {
      type: String,
      default: '',
    },
    // 图片样式
    imageStyle: {
      type: Object,
      default: () => ({}),
    },
    // 图片alt属性
    alt: {
      type: String,
      default: '图片',
    },
  },
  emits: ['load', 'error', 'click'],
  setup(props, { emit }) {
    const imageSrc = ref('')
    // 计算图片源
    const updateImage = async () => {
      const result = await electron.cache.get(props.cacheType, props.fileName) || ''
      imageSrc.value = result
    }

    // 监听属性变化
    watch(() => props.fileName, () => {
      updateImage()
    }, { immediate: true })

    // 事件处理
    const handleLoad = (event: Event) => {
      emit('load', event)
    }

    const handleError = (event: Event) => {
      console.error('图片加载失败:', event)
      emit('error', event)
    }

    const handleClick = (event: Event) => {
      emit('click', event)
    }

    return {
      imageSrc,
      handleLoad,
      handleError,
      handleClick,
    }
  },
}
</script>

<style lang="less" scoped>
img {
  display: block;
  max-width: 100%;
  height: auto;

  &[loading="lazy"] {
    opacity: 0;
    transition: opacity 0.3s ease;

    &:not([src=""]) {
      opacity: 1;
    }
  }
}
</style>
