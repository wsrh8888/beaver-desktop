<template>
  <div class="message-image">
    <div :style="{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }">
      <BeaverImage
        :file-name="message.msg.imageMsg.fileName"
        alt="图片"
        image-class="message-image-content"
        @click="handleImageClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { previewOnlineFileApi } from 'renderModule/api/file'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { calculateImageSize } from 'renderModule/utils/image/index'

export default defineComponent({
  name: 'ImageMessage',
  components: {
    BeaverImage,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // 计算图片尺寸
    const imageSize = computed(() => {
      if (props.message.msg.type === 2 && props.message.msg.imageMsg) {
        const imageMsg = props.message.msg.imageMsg
        const { width, height } = imageMsg || {}
        if (width && height) {
          return calculateImageSize(width, height)
        }
      }
      // 如果没有尺寸信息，返回默认值
      return { width: 200, height: 200 }
    })

    // 处理图片点击
    const handleImageClick = async () => {
      const fileName = props.message.msg.imageMsg?.fileName
      if (!fileName) return

      try {
        // 获取图片URL（优先使用缓存，否则使用在线URL）
        let imageUrl = previewOnlineFileApi(fileName)
        try {
          const cachedUrl = await electron.cache.get('user_avatar', fileName)
          if (cachedUrl) {
            imageUrl = cachedUrl
          }
        }
        catch {
          // 缓存获取失败，使用在线URL
        }
        
        // 打开图片查看器窗口
        await electron.window.openWindow('image', {
          unique: true,
          params: {
            url: imageUrl,
            list: [imageUrl], // 可以扩展为图片列表
            index: 0,
          },
        })
      }
      catch (error) {
        console.error('打开图片查看器失败:', error)
      }
    }

    return {
      imageSize,
      handleImageClick,
    }
  },
})
</script>

<style lang="less" scoped>
.message-image {
  max-width: 240px;
  border-radius: 8px;
  overflow: hidden;

  .message-image-content {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }
}
</style>

