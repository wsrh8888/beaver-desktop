<template>
  <div class="text-message-wrapper">
    <!-- 引用/回复预览 -->
    <div v-if="message.msg.replyMsg" class="reply-preview">
      <span class="reply-sender">{{ message.msg.replyMsg.replyToSender }}：</span>
      <span class="reply-content">{{ message.msg.replyMsg.replyToContent }}</span>
    </div>
    <div class="message-text selectable" v-html="formattedContent" />
  </div>
</template>

<script lang="ts">
import { emojiMap } from 'renderModule/windows/app/utils/emoji'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'TextMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // 格式化文本消息，将表情符号替换为图片
    const formattedContent = computed(() => {
      const text = props.message.msg.textMsg?.content
      if (!text) {
        return ''
      }

      // 使用正则表达式匹配 [xxx] 格式的表情
      return text.replace(/\[[^\]]+\]/g, (match) => {
        const emojiUrl = emojiMap(match)
        if (emojiUrl) {
          return `<img src="${emojiUrl}" alt="${match}" class="message-emoji" draggable="false" />`
        }
        return match
      })
    })

    return {
      formattedContent,
    }
  },
})
</script>

<style lang="less" scoped>
.text-message-wrapper {
  display: flex;
  flex-direction: column;
}

.reply-preview {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-left: 2px solid #B2BEC3;
  border-radius: 2px 2px 0 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;

  .reply-sender {
    color: #636E72;
    font-weight: 500;
  }

  .reply-content {
    color: #909399;
  }
}

.message-text {
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  color: #2D3436;
  padding: 5px;
  /* 覆盖全局 user-select: none，允许选中文字后复制 */
  -webkit-user-select: text;
  user-select: text;
}

:deep(.message-emoji) {
  display: inline-block;
  width: 35px;
  height: 35px;
  vertical-align: middle;
  margin: 0 2px;
  user-select: none;
}
</style>
