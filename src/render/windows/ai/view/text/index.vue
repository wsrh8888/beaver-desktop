<template>
  <div class="ai-text-view">
    <AiRightHeader :title="currentChat?.title || '海狸助手'" />
    <AiRightContent :messages="currentChat?.messages ?? []" />
    <AiRightBottom
      :input-value="inputValue"
      @update:input-value="$emit('update:inputValue', $event)"
      @send="$emit('send')"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import AiRightHeader from 'renderModule/windows/ai/view/right/header/header.vue'
import AiRightContent from 'renderModule/windows/ai/view/right/content/content.vue'
import AiRightBottom from 'renderModule/windows/ai/view/right/bottom/index.vue'

export default defineComponent({
  name: 'AiTextView',
  components: {
    AiRightHeader,
    AiRightContent,
    AiRightBottom,
  },
  props: {
    inputValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:inputValue', 'send'],
  setup() {
    const aiChatStore = useAiChatStore()
    const currentChat = computed(() => aiChatStore.currentChat)

    return {
      currentChat,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-text-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
