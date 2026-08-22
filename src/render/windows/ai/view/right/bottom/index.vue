<template>
  <div class="ai-right-bottom">
    <textarea
      :value="inputValue"
      class="ai-right-bottom__textarea"
      placeholder="向海狸助手提问，例如：总结项目群今天的讨论..."
      @input="$emit('update:inputValue', ($event.target as HTMLTextAreaElement).value)"
      @keydown="handleKeydown"
    />
    <div class="ai-right-bottom__actions">
      <button
        class="ai-right-bottom__send-btn"
        type="button"
        :disabled="!inputValue.trim()"
        @click="$emit('send')"
      >
        <img src="renderModule/assets/image/assistant/send.svg" alt="发送">
        <span>发送</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiRightBottom',
  props: {
    inputValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:inputValue', 'send'],
  setup(_props, { emit }) {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        emit('send')
      }
    }

    return {
      handleKeydown,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-right-bottom {
  padding: 16px 24px;
  border-top: 1px solid #EBEEF5;
  flex-shrink: 0;

  &__textarea {
    width: 100%;
    min-height: 72px;
    max-height: 160px;
    padding: 12px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: #2D3436;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;

    &:focus {
      border-color: #FF7D45;
      box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.12);
    }

    &::placeholder {
      color: #B2BEC3;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  &__send-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: #FFFFFF;
    font-size: 13px;
    cursor: pointer;

    img {
      width: 16px;
      height: 16px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
