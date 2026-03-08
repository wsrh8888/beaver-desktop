<template>
  <div class="ai-right-view">
    <AiRightHeader :title="title" />
    <AiRightContent :messages="messages" />
    <AiRightBottom
      :input-value="inputValue"
      @update:input-value="$emit('update:inputValue', $event)"
      @send="$emit('send')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiRightHeader from 'renderModule/windows/ai/view/right/header/header.vue'
import AiRightContent, { type AiRightContentMessageItem } from 'renderModule/windows/ai/view/right/content/content.vue'
import AiRightBottom from 'renderModule/windows/ai/view/right/bottom/index.vue'

export type AiChatMessageItem = AiRightContentMessageItem

export default defineComponent({
  name: 'AiViewRight',
  components: {
    AiRightHeader,
    AiRightContent,
    AiRightBottom
  },
  props: {
    title: {
      type: String,
      default: 'AI助手'
    },
    messages: {
      type: Array as () => AiRightContentMessageItem[],
      default: () => []
    },
    inputValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:inputValue', 'send']
})
</script>

<style lang="less" scoped>
.ai-right-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
