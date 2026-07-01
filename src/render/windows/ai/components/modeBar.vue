<template>
  <div class="ai-mode-bar">
    <div class="ai-mode-bar__tabs">
      <button
        class="ai-mode-bar__tab"
        :class="{ active: aiViewStore.isTextMode }"
        type="button"
        @click="aiViewStore.setInputMode('text')"
      >
        <img src="renderModule/assets/image/assistant/keyboard.svg" alt="文字">
        <span>文字</span>
      </button>
      <button
        class="ai-mode-bar__tab"
        :class="{ active: aiViewStore.isVoiceMode }"
        type="button"
        @click="aiViewStore.setInputMode('voice')"
      >
        <img src="renderModule/assets/image/assistant/voice.svg" alt="语音">
        <span>语音</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAiViewStore } from 'renderModule/windows/ai/store/view'

export default defineComponent({
  name: 'AiModeBar',
  setup() {
    const aiViewStore = useAiViewStore()
    return { aiViewStore }
  },
})
</script>

<style lang="less" scoped>
.ai-mode-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;
  background: #FFFFFF;

  &__tabs {
    display: flex;
    height: 40px;
  }

  &__tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 24px;
    border: none;
    background: transparent;
    color: #636E72;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;

    img {
      width: 16px;
      height: 16px;
    }

    &.active {
      color: #2D3436;

      &::after {
        content: '';
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: 0;
        height: 2px;
        background: #FF7D45;
      }
    }

    &:hover:not(.active) {
      color: #FF7D45;
    }
  }
}
</style>
