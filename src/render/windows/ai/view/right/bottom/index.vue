<template>
  <div class="ai-right-bottom">
    <div class="ai-right-bottom__toolbar">
      <button class="ai-right-bottom__toolbar-btn" title="快速">
        <img src="renderModule/assets/image/common/add.svg" alt="add" class="ai-right-bottom__icon">
        快速
      </button>
      <button class="ai-right-bottom__toolbar-btn" title="互联网搜索">
        <img src="renderModule/assets/image/ai/globe.svg" alt="globe" class="ai-right-bottom__icon">
        互联网搜索
      </button>
    </div>
    <div class="ai-right-bottom__input-wrap">
      <input
        :value="inputValue"
        type="text"
        class="ai-right-bottom__input"
        placeholder="好问题，是智慧的开始"
        @input="$emit('update:inputValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('send')"
      >
      <button class="ai-right-bottom__send-btn" @click="$emit('send')">
        <img src="renderModule/assets/image/ai/send.svg" alt="send">
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
      default: ''
    }
  },
  emits: ['update:inputValue', 'send']
})
</script>

<style lang="less" scoped>
.ai-right-bottom {
  padding: 16px 24px;
  border-top: 1px solid #EBEEF5;
  flex-shrink: 0;

  .ai-right-bottom__toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .ai-right-bottom__toolbar-btn {
      height: 32px;
      padding: 0 12px;
      background: #F9FAFB;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 12px;
      color: #636E72;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;

      .ai-right-bottom__icon {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: #EBEEF5;
      }
    }
  }

  .ai-right-bottom__input-wrap {
    display: flex;
    gap: 8px;
    align-items: center;

    .ai-right-bottom__input {
      flex: 1;
      height: 40px;
      min-height: 40px;
      padding: 12px 16px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 13px;
      color: #2D3436;

      &::placeholder {
        color: #B2BEC3;
      }

      &:focus {
        outline: none;
        border-color: #FF7D45;
      }
    }

    .ai-right-bottom__send-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      background: #FF7D45;
      color: #FFFFFF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: #E86835;
      }
    }
  }
}
</style>
