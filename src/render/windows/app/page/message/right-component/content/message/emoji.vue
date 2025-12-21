<template>
  <div class="message-emoji">
    <div class="emoji-content" :style="{ width: emojiSize.width + 'px', height: emojiSize.height + 'px' }">
      <BeaverImage :file-name="message.msg.emojiMsg.fileKey" alt="表情" image-class="emoji-image" />
    </div>
  </div>
</template>

<script lang="ts">
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent, computed, ref } from 'vue'

export default defineComponent({
  name: 'EmojiMessage',
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
    // 计算表情显示尺寸
    const emojiSize = computed(() => {
      if (props.message.msg.type === 6 && props.message.msg.emojiMsg) {
        const emojiMsg = props.message.msg.emojiMsg
        const width = emojiMsg.width || 64
        const height = emojiMsg.height || 64

        // 限制最大尺寸，避免过大的表情影响聊天体验
        const maxSize = 120
        const minSize = 32

        // 如果图片太大，按比例缩放
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          return {
            width: Math.max(minSize, Math.round(width * ratio)),
            height: Math.max(minSize, Math.round(height * ratio))
          }
        }

        // 如果图片太小，保持最小尺寸
        return {
          width: Math.max(minSize, width),
          height: Math.max(minSize, height)
        }
      }

      // 默认尺寸
      return { width: 64, height: 64 }
    })

    return {
      emojiSize,
    }
  },
})
</script>

<style lang="less" scoped>
.message-emoji {
  .emoji-content {
    display: flex;
    align-items: center;
    justify-content: center;

    .emoji-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }
  }
}
</style>
