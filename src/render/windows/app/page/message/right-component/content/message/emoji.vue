<template>
  <div class="message-emoji">
    <div class="emoji-content" :style="{ width: emojiSize.width + 'px', height: emojiSize.height + 'px' }">
      <BeaverImage
        :file-name="message.msg.emojiMsg.fileKey"
        alt="表情"
        image-class="emoji-image"
        @click="handleEmojiClick"
      />
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
    const showEmojiInfo = ref(false)

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

    // 获取表情标题（优先使用自定义标题，否则使用默认格式）
    const emojiTitle = computed(() => {
      if (props.message.msg.type === 6 && props.message.msg.emojiMsg) {
        const emojiMsg = props.message.msg.emojiMsg
        // 这里可以根据业务逻辑返回表情标题
        // 暂时返回默认格式
        return `表情 ${emojiMsg.emojiId || ''}`
      }
      return '表情'
    })

    // 获取表情包名称
    const packageName = computed(() => {
      if (props.message.msg.type === 6 && props.message.msg.emojiMsg) {
        const emojiMsg = props.message.msg.emojiMsg
        // 这里可以根据packageId查询表情包名称
        // 暂时返回packageId
        return emojiMsg.packageId || ''
      }
      return ''
    })

    // 处理表情点击
    const handleEmojiClick = () => {
      // 可以在这里添加表情点击的交互逻辑
      // 比如显示表情详情、添加到收藏等
      showEmojiInfo.value = !showEmojiInfo.value
    }

    return {
      showEmojiInfo,
      emojiSize,
      emojiTitle,
      packageName,
      handleEmojiClick,
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
      padding: 8px;
      background: rgba(255, 125, 69, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 125, 69, 0.1);

      .emoji-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

    .emoji-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      color: #666;
      text-align: center;

      .emoji-title {
        font-weight: 500;
        color: #333;
      }

      .emoji-package {
        font-size: 10px;
        color: #999;
        opacity: 0.8;
      }
    }
  }
}
</style>
