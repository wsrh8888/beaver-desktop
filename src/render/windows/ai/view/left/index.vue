<template>
  <AiSidebar
    :chat-list="chatList"
    :current-chat-id="currentChatId"
    @new-chat="$emit('newChat')"
    @select="$emit('select', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiSidebar from 'renderModule/windows/ai/components/sidebar.vue'

export default defineComponent({
  name: 'AiViewLeft',
  components: { AiSidebar },
  props: {
    chatList: {
      type: Array as () => Array<{ id: string; title: string; timestamp: number }>,
      required: true
    },
    currentChatId: {
      type: String,
      default: ''
    }
  },
  emits: ['newChat', 'select']
})
</script>
