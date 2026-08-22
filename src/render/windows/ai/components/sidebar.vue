<template>
  <div class="ai-sidebar">
    <div class="ai-sidebar__header">
      <div class="ai-sidebar__title">
        AI 助手
      </div>
      <button class="ai-sidebar__primary-btn" type="button" @click="$emit('newChat')">
        <img src="renderModule/assets/image/common/add.svg" alt="add" class="ai-sidebar__btn-icon ai-sidebar__btn-icon--light">
        发起新会话
      </button>
      <button class="ai-sidebar__secondary-btn" type="button" @click="$emit('openSkillStore')">
        <img src="renderModule/assets/image/assistant/skill.svg" alt="skill" class="ai-sidebar__btn-icon">
        技能商店
      </button>
    </div>

    <div class="ai-sidebar__section-label">
      会话记录
    </div>

    <div class="ai-sidebar__list">
      <div
        v-for="chat in chatList"
        :key="chat.id"
        class="ai-sidebar__item"
        :class="{ active: currentChatId === chat.id && !isSkillView }"
        @click="$emit('select', chat.id)"
      >
        <div class="ai-sidebar__item-main">
          <div class="ai-sidebar__item-title">
            {{ chat.title }}
          </div>
          <div class="ai-sidebar__item-time">
            {{ formatChatTime(chat.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { IAiChatListItem } from 'renderModule/windows/ai/types/chat'
import { formatChatTime } from 'renderModule/windows/ai/utils/formatTime'

export default defineComponent({
  name: 'AiSidebar',
  props: {
    chatList: {
      type: Array as () => IAiChatListItem[],
      required: true,
    },
    currentChatId: {
      type: String,
      default: '',
    },
    isSkillView: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['newChat', 'select', 'openSkillStore'],
  setup() {
    return { formatChatTime }
  },
})
</script>

<style lang="less" scoped>
.ai-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;

  &__header {
    padding: 16px;
    border-bottom: 1px solid #EBEEF5;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 16px;
  }

  &__primary-btn,
  &__secondary-btn {
    width: 100%;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
  }

  &__primary-btn {
    border: none;
    color: #FFFFFF;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    box-shadow: 0 4px 12px rgba(255, 125, 69, 0.28);

    &:hover {
      box-shadow: 0 6px 16px rgba(255, 125, 69, 0.34);
    }
  }

  &__secondary-btn {
    margin-top: 8px;
    border: 1px solid #FF7D45;
    color: #FF7D45;
    background: #FFFFFF;

    &:hover {
      background: #FFE6D9;
    }
  }

  &__btn-icon {
    width: 16px;
    height: 16px;

    &--light {
      filter: brightness(0) invert(1);
    }
  }

  &__section-label {
    padding: 12px 16px 8px;
    font-size: 12px;
    font-weight: 500;
    color: #636E72;
  }

  &__list {
    flex: 1;
    overflow-y: auto;
  }

  &__item {
    position: relative;
    min-height: 72px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #EBEEF5;
    transition: background 0.2s;

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      background: rgba(255, 125, 69, 0.12);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 16px;
        bottom: 16px;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background: #FF7D45;
      }
    }
  }

  &__item-title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-time {
    font-size: 12px;
    color: #636E72;
  }
}
</style>
