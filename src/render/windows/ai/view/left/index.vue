<template>
  <AiSidebar
    :chat-list="chatList"
    :current-chat-id="currentChatId"
    :is-skill-view="isSkillView"
    @new-chat="$emit('newChat')"
    @select="$emit('select', $event)"
    @open-skill-store="$emit('openSkillStore')"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiSidebar from 'renderModule/windows/ai/components/sidebar.vue'
import type { IAiChatListItem } from 'renderModule/windows/ai/types/chat'

export default defineComponent({
  name: 'AiViewLeft',
  components: { AiSidebar },
  props: {
    chatList: {
      type: Array as () => IAiChatListItem[],
      required: true,
    },
    currentChatId: {
      type: String,
      default: '',
    },
    isSkillView: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['newChat', 'select', 'openSkillStore'],
})
</script>
