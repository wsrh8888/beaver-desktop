<template>
  <div class="ai-right-header">
    <div class="ai-right-header__info">
      <h2>{{ title }}</h2>
    </div>
    <div class="ai-right-header__actions">
      <button class="ai-right-header__btn" title="刷新">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="refresh">
      </button>
      <button class="ai-right-header__btn" title="复制">
        <img src="renderModule/assets/image/ai/copy.svg" alt="copy">
      </button>
      <button class="ai-right-header__btn" title="分享">
        <img src="renderModule/assets/image/ai/share.svg" alt="share">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiRightHeader',
  props: {
    title: {
      type: String,
      default: 'AI助手'
    }
  }
})
</script>

<style lang="less" scoped>
.ai-right-header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  .ai-right-header__info h2 {
    font-size: 16px;
    font-weight: 500;
    color: #2D3436;
    margin: 0;
  }

  .ai-right-header__actions {
    display: flex;
    gap: 8px;

    .ai-right-header__btn {
      width: 32px;
      height: 32px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      background: #FFFFFF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #636E72;

      img {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: #F9FAFB;
      }
    }
  }
}
</style>
