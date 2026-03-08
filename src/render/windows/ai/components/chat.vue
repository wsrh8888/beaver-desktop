<template>
  <div class="ai-chat">
    <div class="ai-chat__header">
      <div class="ai-chat__info">
        <h2>{{ title }}</h2>
      </div>
      <div class="ai-chat__actions">
        <button class="ai-chat__action-btn" title="刷新">
          <img src="renderModule/assets/image/moment/refresh.svg" alt="refresh">
        </button>
        <button class="ai-chat__action-btn" title="复制">
          <img src="renderModule/assets/image/ai/copy.svg" alt="copy">
        </button>
        <button class="ai-chat__action-btn" title="分享">
          <img src="renderModule/assets/image/ai/share.svg" alt="share">
        </button>
      </div>
    </div>

    <div class="ai-chat__messages">
      <div v-if="!hasMessages" class="ai-chat__empty">
        <div class="ai-chat__empty-icon">
          <img src="renderModule/assets/image/ai/robot.svg" alt="AI">
        </div>
        <h3>与AI助手对话</h3>
        <p>开始一个新的对话，获取智能回答</p>
      </div>
      <div v-else class="ai-chat__list">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="ai-chat__message"
          :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
        >
          <div class="ai-chat__avatar">
            <img v-if="message.role === 'user'" src="renderModule/assets/image/ai/user.svg" alt="user">
            <img v-else src="renderModule/assets/image/ai/robot.svg" alt="AI">
          </div>
          <div class="ai-chat__content">
            <div class="ai-chat__text">{{ message.content }}</div>
            <div class="ai-chat__time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-chat__input-area">
      <div class="ai-chat__toolbar">
        <button class="ai-chat__toolbar-btn" title="快速">
          <img src="renderModule/assets/image/common/add.svg" alt="add" class="ai-chat__toolbar-icon">
          快速
        </button>
        <button class="ai-chat__toolbar-btn" title="互联网搜索">
          <img src="renderModule/assets/image/ai/globe.svg" alt="globe" class="ai-chat__toolbar-icon">
          互联网搜索
        </button>
      </div>
      <div class="ai-chat__input-wrap">
        <input
          :value="inputValue"
          type="text"
          class="ai-chat__input"
          placeholder="好问题，是智慧的开始"
          @input="$emit('update:inputValue', ($event.target as HTMLInputElement).value)"
          @keyup.enter="$emit('send')"
        >
        <button class="ai-chat__send-btn" @click="$emit('send')">
          <img src="renderModule/assets/image/ai/send.svg" alt="send">
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export interface AiChatMessageItem {
  role: string
  content: string
  timestamp: number
}

export default defineComponent({
  name: 'AiChat',
  props: {
    title: {
      type: String,
      default: 'AI助手'
    },
    messages: {
      type: Array as () => AiChatMessageItem[],
      default: () => []
    },
    inputValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:inputValue', 'send'],
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
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ai-chat__header {
    height: 64px;
    padding: 0 24px;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .ai-chat__info h2 {
      font-size: 16px;
      font-weight: 500;
      color: #2D3436;
      margin: 0;
    }

    .ai-chat__actions {
      display: flex;
      gap: 8px;

      .ai-chat__action-btn {
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

  .ai-chat__messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;

    .ai-chat__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #636E72;

      .ai-chat__empty-icon {
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

    .ai-chat__list {
      .ai-chat__message {
        display: flex;
        margin-bottom: 12px;

        &.user-message {
          flex-direction: row-reverse;

          .ai-chat__content {
            background: #FFE6D9;
            border-radius: 12px 4px 12px 12px;
          }
        }

        &.ai-message {
          .ai-chat__content {
            background: #F9FAFB;
            border-radius: 4px 12px 12px 12px;
          }
        }

        .ai-chat__avatar {
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

        .ai-chat__content {
          flex: 1;
          max-width: 70%;
          padding: 12px;

          .ai-chat__text {
            font-size: 13px;
            line-height: 1.5;
            color: #2D3436;
            margin-bottom: 8px;
          }

          .ai-chat__time {
            font-size: 11px;
            color: #B2BEC3;
            text-align: right;
          }
        }
      }
    }
  }

  .ai-chat__input-area {
    padding: 16px 24px;
    border-top: 1px solid #EBEEF5;
    flex-shrink: 0;

    .ai-chat__toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;

      .ai-chat__toolbar-btn {
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

        .ai-chat__toolbar-icon {
          width: 14px;
          height: 14px;
        }

        &:hover {
          background: #EBEEF5;
        }
      }
    }

    .ai-chat__input-wrap {
      display: flex;
      gap: 8px;
      align-items: center;

      .ai-chat__input {
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

      .ai-chat__send-btn {
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
}
</style>
