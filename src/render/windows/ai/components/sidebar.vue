<template>
  <div class="ai-sidebar">
    <div class="ai-sidebar__header">
      <div class="ai-sidebar__title">AI助手</div>
      <button class="ai-sidebar__new-btn" @click="$emit('newChat')">
        <img src="renderModule/assets/image/common/add.svg" alt="add" class="ai-sidebar__add-icon">
        发起新会话
      </button>
    </div>
    <div class="ai-sidebar__list">
      <div
        v-for="chat in chatList"
        :key="chat.id"
        class="ai-sidebar__item"
        :class="{ active: currentChatId === chat.id }"
        @click="$emit('select', chat.id)"
      >
        <div class="ai-sidebar__preview">
          <div class="ai-sidebar__item-title">{{ chat.title }}</div>
          <div class="ai-sidebar__item-time">{{ formatTime(chat.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiSidebar',
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
  emits: ['newChat', 'select'],
  setup() {
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return { formatTime }
  }
})
</script>

<style lang="less" scoped>
.ai-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ai-sidebar__header {
    padding: 16px;
    border-bottom: 1px solid #EBEEF5;

    .ai-sidebar__title {
      font-size: 16px;
      font-weight: 600;
      color: #2D3436;
      margin-bottom: 16px;
    }

    .ai-sidebar__new-btn {
      width: 100%;
      height: 36px;
      padding: 0 16px;
      background: #FFFFFF;
      border: 1px solid #FF7D45;
      border-radius: 6px;
      color: #FF7D45;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .ai-sidebar__add-icon {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: #FFE6D9;
      }
    }
  }

  .ai-sidebar__list {
    flex: 1;
    overflow-y: auto;

    .ai-sidebar__item {
      padding: 16px;
      cursor: pointer;
      border-bottom: 1px solid #EBEEF5;
      min-height: 72px;
      box-sizing: border-box;
      display: flex;
      align-items: center;

      &:hover {
        background: #F9FAFB;
      }

      &.active {
        background: rgba(255, 125, 69, 0.1);
      }

      .ai-sidebar__preview {
        .ai-sidebar__item-title {
          font-size: 14px;
          font-weight: 500;
          color: #2D3436;
          margin-bottom: 4px;
        }

        .ai-sidebar__item-time {
          font-size: 12px;
          color: #B2BEC3;
        }
      }
    }
  }
}
</style>
