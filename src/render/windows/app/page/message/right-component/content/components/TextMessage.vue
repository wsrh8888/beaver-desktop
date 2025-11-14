<template>
  <div class="message-text selectable" v-html="formattedContent" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { emojiMap } from 'renderModule/windows/app/utils/emoji'

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
.message-text {
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  color: #2D3436;
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

