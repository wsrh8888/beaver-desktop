<template>
  <div class="ai-voice-view">
    <div class="ai-voice-view__banner">
      <div class="ai-voice-view__banner-label">
        接着聊
      </div>
      <div class="ai-voice-view__banner-title">
        {{ sessionTitle }}
      </div>
    </div>

    <div class="ai-voice-view__stage">
      <div
        class="ai-voice-view__status"
        :class="statusClass"
      >
        {{ statusText }}
      </div>

      <div v-if="aiViewStore.segmentText" class="ai-voice-view__segment user">
        {{ aiViewStore.segmentText }}
      </div>
      <div v-if="aiViewStore.speakingText" class="ai-voice-view__segment assistant">
        {{ aiViewStore.speakingText }}
      </div>

      <div
        class="ai-voice-view__wave"
        :class="{ active: aiViewStore.isListening || aiViewStore.speakingText }"
      >
        <span v-for="i in 5" :key="i" class="ai-voice-view__wave-bar" />
      </div>

      <button
        class="ai-voice-view__mic"
        :class="{
          listening: aiViewStore.isListening,
          active: aiViewStore.isVoiceSessionActive,
        }"
        type="button"
        @click="handleMicClick"
      >
        <img src="renderModule/assets/image/assistant/mic.svg" alt="麦克风">
      </button>

      <div class="ai-voice-view__hint">
        {{ micHint }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import { useAiViewStore } from 'renderModule/windows/ai/store/view'

const DEMO_SEGMENT = '帮我看看今天有哪些未读需要处理'

export default defineComponent({
  name: 'AiVoiceView',
  setup() {
    const aiChatStore = useAiChatStore()
    const aiViewStore = useAiViewStore()

    const sessionTitle = computed(() => aiChatStore.latestChat?.title || '海狸助手')

    const statusText = computed(() => {
      if (aiViewStore.isListening)
        return '正在聆听…'
      if (aiViewStore.speakingText)
        return '海狸正在说…'
      if (aiViewStore.isVoiceSessionActive)
        return '请说话'
      return '点击麦克风开始'
    })

    const statusClass = computed(() => {
      if (aiViewStore.isListening)
        return 'listening'
      if (aiViewStore.speakingText)
        return 'speaking'
      if (!aiViewStore.isVoiceSessionActive)
        return 'idle'
      return ''
    })

    const micHint = computed(() => {
      if (aiViewStore.isListening)
        return '再次点击结束本语段'
      if (aiViewStore.isVoiceSessionActive)
        return '语段说完自动发送 · 再次长按结束会话'
      return '从最近一次会话接着聊，按语段说话'
    })

    const playVoiceReply = (question: string) => {
      const reply = `关于「${question}」，这是语音回复。接入 TTS 后将直接播报。`
      aiViewStore.setSpeakingText(reply)
      aiChatStore.sendVoiceSegment(question)
      window.setTimeout(() => {
        aiViewStore.setSpeakingText('')
      }, 3000)
    }

    const handleMicClick = () => {
      if (!aiViewStore.isVoiceSessionActive) {
        aiViewStore.setVoiceSessionActive(true)
        aiViewStore.setListening(true)
        return
      }

      if (aiViewStore.isListening) {
        aiViewStore.setListening(false)
        aiViewStore.setSegmentText(DEMO_SEGMENT)
        window.setTimeout(() => {
          aiViewStore.setSegmentText('')
          playVoiceReply(DEMO_SEGMENT)
        }, 400)
        return
      }

      aiViewStore.setVoiceSessionActive(false)
    }

    return {
      aiViewStore,
      sessionTitle,
      statusText,
      statusClass,
      micHint,
      handleMicClick,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-voice-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 240px);

  &__banner {
    padding: 24px;
    text-align: center;
    flex-shrink: 0;
  }

  &__banner-label {
    font-size: 12px;
    font-weight: 500;
    color: #FF7D45;
    margin-bottom: 4px;
  }

  &__banner-title {
    font-size: 20px;
    font-weight: 600;
    color: #2D3436;
  }

  &__stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  &__status {
    font-size: 15px;
    font-weight: 500;
    color: #636E72;
    margin-bottom: 24px;

    &.listening {
      color: #FF7D45;
    }

    &.speaking {
      color: #4A6FA1;
    }

    &.idle {
      color: #636E72;
    }
  }

  &__segment {
    max-width: 480px;
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &.user {
      background: #FFE6D9;
      color: #2D3436;
    }

    &.assistant {
      background: #FFFFFF;
      border: 1px solid #EBEEF5;
      color: #2D3436;
    }
  }

  &__wave {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    margin-bottom: 32px;
    opacity: 0.2;

    &.active {
      opacity: 1;
    }
  }

  &__wave-bar {
    width: 4px;
    height: 12px;
    border-radius: 2px;
    background: #FF7D45;
    animation: wave 0.8s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.3s; }
    &:nth-child(5) { animation-delay: 0.4s; }
  }

  &__mic {
    width: 96px;
    height: 96px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 32px rgba(255, 125, 69, 0.35);
    transition: transform 0.2s;

    img {
      width: 36px;
      height: 36px;
    }

    &:hover {
      transform: scale(1.04);
    }

    &.listening {
      animation: pulse 1.2s ease-in-out infinite;
    }

    &.active {
      box-shadow: 0 0 0 12px rgba(255, 125, 69, 0.14);
    }
  }

  &__hint {
    margin-top: 24px;
    font-size: 13px;
    color: #636E72;
    text-align: center;
    max-width: 360px;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

@keyframes wave {
  0%, 100% { height: 12px; }
  50% { height: 28px; }
}
</style>
