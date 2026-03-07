<template>
  <div class="merged-forward-bubble" @click="$emit('view', message.msg.forwardMsg)">
    <div class="mf-title">{{ message.msg.forwardMsg.title }}</div>
    <div class="mf-summary">
      <span class="mf-count">共 {{ message.msg.forwardMsg.count || 0 }} 条聊天记录</span>
    </div>
    <div class="mf-divider" />
    <div class="mf-link">查看聊天记录详情</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MergedForwardMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ['view'],
  setup() {
    return {}
  },
})
</script>

<style lang="less" scoped>
.merged-forward-bubble {
  min-width: 180px;
  max-width: 240px;
  cursor: pointer;
  user-select: none;

  .mf-title {
    font-size: 14px;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mf-summary {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .mf-count {
      font-size: 12px;
      color: #636E72;
      opacity: 0.8;
    }
  }

  .mf-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.05);
    margin: 10px 0;
  }

  .mf-link {
    font-size: 12px;
    color: #636E72;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &::after {
      content: '>';
      font-family: monospace;
      margin-left: 4px;
      opacity: 0.5;
    }
  }

  &:hover {
    background-color: #F8F9FA;

    .mf-link {
      color: #2D3436;
    }
  }
}
</style>
