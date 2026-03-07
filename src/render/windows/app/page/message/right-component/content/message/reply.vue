<template>
  <div class="reply-message">
    <div v-if="message.msg?.replyMsg?.originMsg" class="reply-origin">
      <div class="origin-content">
        <span class="origin-tag">引用：</span>
        <span class="origin-text">{{ originPreview }}</span>
      </div>
    </div>
    <div class="reply-main">
      {{ message.msg?.replyMsg?.replyContent }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

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
      // 简单处理引用预览，后续可根据 type 展示不同的摘要
      const msg = props.message.msg?.replyMsg?.originMsg
      if (!msg) return ''
      return '消息记录' // 可以扩展为具体的文字预览
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
