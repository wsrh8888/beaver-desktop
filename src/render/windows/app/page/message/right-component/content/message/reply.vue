<template>
  <div class="reply-message">
    <div v-if="msg.replyMsg?.originMsg" class="reply-origin">
      <div class="origin-content">
        <TextMessage v-if="msg.replyMsg.originMsg.type === MessageType.TEXT" :msg="msg.replyMsg.originMsg" />
        <ImageMessage v-else-if="msg.replyMsg.originMsg.type === MessageType.IMAGE" :msg="msg.replyMsg.originMsg" />
        <VideoMessage v-else-if="msg.replyMsg.originMsg.type === MessageType.VIDEO" :msg="msg.replyMsg.originMsg" />
        <EmojiMessage v-else-if="msg.replyMsg.originMsg.type === MessageType.EMOJI" :msg="msg.replyMsg.originMsg" />
        <AudioFileMessage v-else-if="msg.replyMsg.originMsg.type === MessageType.AUDIO_FILE"
          :msg="msg.replyMsg.originMsg" />
        <!-- 如果被回复的消息也是一条回复，则展示那条回复的内容主体 -->
        <ReplyMessage v-else-if="msg.replyMsg.originMsg.type === MessageType.REPLY" :msg="msg.replyMsg.originMsg"
          :sender="sender" />
      </div>
    </div>
    <div class="reply-main">
      <TextMessage v-if="msg.replyMsg?.replyMsg?.type === MessageType.TEXT" :msg="msg.replyMsg.replyMsg" />
      <ImageMessage v-else-if="msg.replyMsg?.replyMsg?.type === MessageType.IMAGE" :msg="msg.replyMsg.replyMsg" />
      <VideoMessage v-else-if="msg.replyMsg?.replyMsg?.type === MessageType.VIDEO" :msg="msg.replyMsg.replyMsg" />
      <EmojiMessage v-else-if="msg.replyMsg?.replyMsg?.type === MessageType.EMOJI" :msg="msg.replyMsg.replyMsg" />
      <AudioFileMessage v-else-if="msg.replyMsg?.replyMsg?.type === MessageType.AUDIO_FILE"
        :msg="msg.replyMsg.replyMsg" />
    </div>
  </div>
</template>

<script lang="ts">
import { IMessageMsg, IMessageSender } from 'commonModule/type/ws/message-types'
import { MessageType } from 'commonModule/type/ajax/chat'
import { defineComponent, PropType } from 'vue'

// 使用异步组件或直接导入，取决于是否担心循环依赖。这里先直接导入。
import TextMessage from './text.vue'
import ImageMessage from './image.vue'
import VideoMessage from './video.vue'
import EmojiMessage from './emoji.vue'
import AudioFileMessage from './audio.vue'

export default defineComponent({
  name: 'ReplyMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
    sender: {
      type: Object as PropType<IMessageSender>,
      required: true,
    },
  },
  components: {
    TextMessage,
    ImageMessage,
    VideoMessage,
    EmojiMessage,
    AudioFileMessage,
  },
  setup(props) {

    return {
      MessageType,
    }
  },
})
</script>

<style lang="less" scoped>
.reply-message {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .reply-origin {
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    font-size: 11px;
    color: #636E72;
    transition: all 0.2s;

    .origin-content {
      overflow: hidden;
    }
  }

  .reply-main {
    word-break: break-all;
    line-height: 1.4;
  }
}
</style>
