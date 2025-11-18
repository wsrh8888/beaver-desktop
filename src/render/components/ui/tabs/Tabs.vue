<template>
  <div class="beaver-tabs" :class="[`beaver-tabs--${type}`, `beaver-tabs--${size}`]">
    <!-- 标签头 -->
    <div class="beaver-tabs__header">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="beaver-tabs__item"
        :class="{
          'is-active': modelValue === tab.key,
          'is-disabled': tab.disabled,
        }"
        @click="handleTabClick(tab)"
      >
        <span class="beaver-tabs__label">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export interface TabItem {
  key: string
  label: string
  disabled?: boolean
  closable?: boolean
}

export default defineComponent({
  name: 'BeaverTabs',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    tabs: {
      type: Array as () => TabItem[],
      required: true,
    },
    type: {
      type: String,
      default: 'line',
    },
  },
  emits: ['update:modelValue', 'tabClick'],
  setup(_, { emit }) {
    const handleTabClick = (tab: TabItem) => {
      if (tab.disabled)
        return

      emit('update:modelValue', tab.key)
      emit('tabClick', tab.key)
    }

    return {
      handleTabClick,
    }
  },
})
</script>

<style lang="less" scoped>
.beaver-tabs {
  width: 100%;

  // 标签头
  &__header {
    display: flex;
    border-bottom: 1px solid #EBEEF5;
    position: relative;
  }

  &__item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
    color: #636E72;
    border-radius: 6px 6px 0 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    margin-bottom: -1px;

    &:hover:not(.is-disabled) {
      background-color: #F8F9FA;
      color: #2D3436;
    }

    &.is-active {
      background-color: #FFE6D9;
      color: #FF7D45;
      font-weight: 500;
      border-bottom: 2px solid #FF7D45;

      &::before {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #FF7D45;
      }
    }

    &.is-disabled {
      cursor: not-allowed;
      color: #B2BEC3;
      opacity: 0.6;
    }
  }

  &__label {
    white-space: nowrap;
  }

  // 标签内容
  &__content {
    flex: 1;
    padding: 16px 0;
  }

  // 类型变体
  &--card {
    .beaver-tabs__header {
      border-bottom: none;
      background-color: #F8F9FA;
      padding: 8px;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .beaver-tabs__item {
      border-radius: 6px;
      margin-bottom: 0;
      margin-right: 8px;

      &.is-active {
        background-color: #FFFFFF;
        border: 1px solid #EBEEF5;
        border-bottom: none;

        &::before {
          display: none;
        }
      }
    }
  }
}
</style>
