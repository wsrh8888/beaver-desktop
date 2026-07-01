<template>
  <div class="ai-right-header">
    <div class="ai-right-header__info">
      <h2>{{ title }}</h2>
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
      default: 'AI助手',
    },
  },
})
</script>

<style lang="less" scoped>
.ai-right-header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .ai-right-header__info h2 {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    margin: 0;
    line-height: 1.3;
  }
}
</style>
