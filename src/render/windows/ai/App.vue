<template>
  <AiLayout :show-left="aiViewStore.isTextMode">
    <template #mode>
      <AiModeBar v-if="aiViewStore.isChatView" />
    </template>
    <template v-if="aiViewStore.isTextMode" #left>
      <AiViewLeft
        :chat-list="aiChatStore.chatList"
        :current-chat-id="aiChatStore.currentChatId"
        :is-skill-view="aiViewStore.isSkillView"
        @new-chat="handleNewChat"
        @select="handleSelectChat"
        @open-skill-store="aiViewStore.openSkillStore('plaza')"
      />
    </template>
    <template #main>
      <AiSkillView v-if="aiViewStore.isSkillView" />
      <AiTextView
        v-else-if="aiViewStore.isTextMode"
        v-model:input-value="inputMessage"
        @send="handleSendText"
      />
      <AiVoiceView v-else />
    </template>
  </AiLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AiLayout from 'renderModule/windows/ai/components/layout/index.vue'
import AiModeBar from 'renderModule/windows/ai/components/modeBar.vue'
import AiViewLeft from 'renderModule/windows/ai/view/left/index.vue'
import AiTextView from 'renderModule/windows/ai/view/text/index.vue'
import AiVoiceView from 'renderModule/windows/ai/view/voice/index.vue'
import AiSkillView from 'renderModule/windows/ai/view/skill/index.vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import { useAiSkillStore } from 'renderModule/windows/ai/store/skill'
import { useAiViewStore } from 'renderModule/windows/ai/store/view'

export default defineComponent({
  name: 'AiApp',
  components: {
    AiLayout,
    AiModeBar,
    AiViewLeft,
    AiTextView,
    AiVoiceView,
    AiSkillView,
  },
  setup() {
    const aiChatStore = useAiChatStore()
    const aiSkillStore = useAiSkillStore()
    const aiViewStore = useAiViewStore()
    const inputMessage = ref('')

    const handleNewChat = () => {
      aiViewStore.closeSkillStore()
      aiChatStore.startNewChat(aiSkillStore.activeSkillId)
    }

    const handleSelectChat = (id: string) => {
      aiViewStore.closeSkillStore()
      aiChatStore.selectChat(id)
    }

    const handleSendText = () => {
      const text = inputMessage.value.trim()
      if (!text)
        return
      aiChatStore.sendTextMessage(text)
      inputMessage.value = ''
    }

    return {
      aiChatStore,
      aiViewStore,
      inputMessage,
      handleNewChat,
      handleSelectChat,
      handleSendText,
    }
  },
})
</script>

<style lang="less" scoped>
</style>
