<template>
  <div class="ai-right-content">
    <div v-if="!hasMessages" class="ai-right-content__empty">
      <div class="ai-right-content__empty-icon">
        <img src="renderModule/assets/image/ai/robot.svg" alt="AI">
      </div>
      <h3>与AI助手对话</h3>
      <p>开始一个新的对话，获取智能回答</p>
    </div>
    <div v-else class="ai-right-content__list">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="ai-right-content__message"
        :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
      >
        <div class="ai-right-content__avatar">
          <img v-if="message.role === 'user'" src="renderModule/assets/image/ai/user.svg" alt="user">
          <img v-else src="renderModule/assets/image/ai/robot.svg" alt="AI">
        </div>
        <div class="ai-right-content__bubble">
          <div class="ai-right-content__text">{{ message.content }}</div>
          <div class="ai-right-content__time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export interface AiRightContentMessageItem {
  role: string
  content: string
  timestamp: number
}

export default defineComponent({
  name: 'AiRightContent',
  props: {
    messages: {
      type: Array as () => AiRightContentMessageItem[],
      default: () => []
    }
  },
  setup(props) {
    const hasMessages = computed(() => (props.messages?.length ?? 0) > 0)

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }

    return { hasMessages, formatTime }
  }
})
</script>

<style lang="less" scoped>
.ai-right-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .ai-right-content__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #636E72;

    .ai-right-content__empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #B2BEC3;

      img {
        width: 48px;
        height: 48px;
      }
    }

    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #2D3436;
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
      color: #B2BEC3;
    }
  }

  .ai-right-content__list {
    .ai-right-content__message {
      display: flex;
      margin-bottom: 12px;

      &.user-message {
        flex-direction: row-reverse;

        .ai-right-content__bubble {
          background: #FFE6D9;
          border-radius: 12px 4px 12px 12px;
        }
      }

      &.ai-message {
        .ai-right-content__bubble {
          background: #F9FAFB;
          border-radius: 4px 12px 12px 12px;
        }
      }

      .ai-right-content__avatar {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 12px;
        flex-shrink: 0;
        color: #636E72;

        img {
          width: 24px;
          height: 24px;
        }
      }

      .ai-right-content__bubble {
        flex: 1;
        max-width: 70%;
        padding: 12px;

        .ai-right-content__text {
          font-size: 13px;
          line-height: 1.5;
          color: #2D3436;
          margin-bottom: 8px;
        }

        .ai-right-content__time {
          font-size: 11px;
          color: #B2BEC3;
          text-align: right;
        }
      }
    }
  }
}
</style>
