<template>
  <div class="reply-bar">
    <div class="reply-info">
      <span class="reply-label">回复 {{ replyTo.sender.nickName }}：</span>
      <span class="reply-preview">{{ previewText }}</span>
    </div>
    <button class="reply-close" @click="$emit('close')">
      ×
    </button>
  </div>
</template>

<script lang="ts">
import type { IChatHistory } from 'commonModule/type/ajax/chat'
import { MessageType } from 'commonModule/type/ajax/chat'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ReplyBar',
  props: {
    replyTo: {
      type: Object as () => IChatHistory,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const previewText = computed(() => {
      const msg = props.replyTo.msg
      switch (msg.type) {
        case MessageType.TEXT:
          return msg.textMsg?.content?.slice(0, 50) || '[文本]'
        case MessageType.IMAGE:
          return '[图片]'
        case MessageType.VIDEO:
          return '[视频]'
        case MessageType.FILE:
          return '[文件]'
        case MessageType.VOICE:
          return '[语音]'
        case MessageType.EMOJI:
          return '[表情]'
        case MessageType.AUDIO_FILE:
          return '[音频]'
        default:
          return '[消息]'
      }
    })

    return { previewText }
  },
})
</script>

<style lang="less" scoped>
.reply-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #F5F6FA;
  border-left: 3px solid #FF7D45;
  border-top: 1px solid #EBEEF5;
  gap: 8px;

  .reply-info {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    gap: 4px;
    align-items: center;

    .reply-label {
      color: #FF7D45;
      flex-shrink: 0;
      font-weight: 500;
    }

    .reply-preview {
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .reply-close {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #909399;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #606266;
    }
  }
}
</style>
