<template>
  <div class="reply-message">
    <div v-if="message.msg?.replyMsg?.originMsg" class="reply-origin">
      <div class="origin-content">
        <span class="origin-tag">引用：</span>
        <span class="origin-text">{{ originPreview }}</span>
      </div>
    </div>
    <div class="reply-main">
      <template v-if="message.msg?.replyMsg?.replyMsg?.type === 1">
        {{ message.msg?.replyMsg?.replyMsg?.textMsg?.content }}
      </template>
      <template v-else>
        [回复消息]
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { MessageType } from 'commonModule/type/ajax/chat'

export default defineComponent({
  name: 'ReplyMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const originPreview = computed(() => {
      const msg = props.message.msg?.replyMsg?.originMsg
      if (!msg) return ''

      switch (msg.type) {
        case MessageType.TEXT:
          return msg.textMsg?.content || ''
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
        default:
          return '[消息]'
      }
    })

    return {
      originPreview,
    }
  },
})
</script>

<style lang="less" scoped>
.reply-message {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .reply-origin {
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    border-left: 3px solid #FF7D45;
    font-size: 12px;
    color: #636E72;

    .origin-content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .reply-main {
    font-size: 14px;
    color: #2D3436;
    word-break: break-all;
  }
}
</style>
