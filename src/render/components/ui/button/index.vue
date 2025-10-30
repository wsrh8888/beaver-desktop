<template>
  <button
    class="beaver-button" :class="[
      `beaver-button--${type}`,
      `beaver-button--${size}`,
      {
        'is-disabled': disabled,
        'is-loading': loading,
        'is-round': round,
        'is-circle': circle,
        'is-plain': plain,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="beaver-button__loading">
      <svg class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20" fill="none" />
      </svg>
    </span>

    <span v-if="$slots.icon && !loading" class="beaver-button__icon">
      <slot name="icon" />
    </span>

    <span v-if="$slots.default" class="beaver-button__text">
      <slot />
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
export type ButtonSize = 'large' | 'default' | 'small' | 'mini'

export default defineComponent({
  name: 'BeaverButton',
  props: {
    type: {
      type: String as () => ButtonType,
      default: 'default',
    },
    size: {
      type: String as () => ButtonSize,
      default: 'default',
    },
    plain: {
      type: Boolean,
      default: false,
    },
    round: {
      type: Boolean,
      default: false,
    },
    circle: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading)
        return
      emit('click', event)
    }

    return {
      handleClick,
    }
  },
})
</script>

<style lang="less" scoped>
.beaver-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  color: inherit;
  appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  font-weight: 500;
  user-select: none;
  vertical-align: middle;

  // 尺寸
  &--large {
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 6px;

    &.is-round {
      border-radius: 20px;
    }

    &.is-circle {
      border-radius: 50%;
      padding: 12px;
    }
  }

  &--default {
    padding: 12px 20px;
    font-size: 13px;
    border-radius: 6px;
    background: #FFFFFF;
    border: 1px solid #EBEEF5;
    color: #636E72;

    &:hover {
      color: #FF7D45;
      border-color: #FFE6D9;
      background-color: #FFE6D9;
    }

    &.is-round {
      border-radius: 18px;
    }

    &.is-circle {
      border-radius: 50%;
      padding: 12px;
    }

    &.is-disabled {
      opacity: 0.5;
    }
  }

  &--small {
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 4px;

    &.is-round {
      border-radius: 15px;
    }

    &.is-circle {
      border-radius: 50%;
      padding: 9px;
    }
  }

  &--mini {
    padding: 7px 12px;
    font-size: 12px;
    border-radius: 4px;

    &.is-round {
      border-radius: 12px;
    }

    &.is-circle {
      border-radius: 50%;
      padding: 7px;
    }
  }

  // 类型
  &--primary {
    color: #FFFFFF;
    background: #FF7D45;
    border-color: #FF7D45;

    &:hover {
      background: #E86835;
      border-color: #E86835;
      color: #FFFFFF;
    }

    &.is-plain {
      color: #FF7D45;
      background: #FFE6D9;
      border-color: #FFE6D9;

      &:hover,
      &:focus {
        background: #FF7D45;
        border-color: #FF7D45;
        color: #FFFFFF;
      }

      &:active {
        background: #E86835;
        border-color: #E86835;
        color: #FFFFFF;
      }
    }

    &.is-disabled {
      background: #FFB088;
      border-color: #FFB088;
      color: #FFFFFF;
      opacity: 0.6;
    }
  }

  &--success {
    color: #FFFFFF;
    background-color: #4CAF50;
    border-color: #4CAF50;

    &:hover,
    &:focus {
      background: #66BB6A;
      border-color: #66BB6A;
      color: #FFFFFF;
    }

    &:active {
      background: #388E3C;
      border-color: #388E3C;
      color: #FFFFFF;
    }

    &.is-plain {
      color: #4CAF50;
      background: #F1F8E9;
      border-color: #C8E6C9;

      &:hover,
      &:focus {
        background: #4CAF50;
        border-color: #4CAF50;
        color: #FFFFFF;
      }
    }

    &.is-disabled {
      background: #A5D6A7;
      border-color: #A5D6A7;
      color: #FFFFFF;
      opacity: 0.6;
    }
  }

  &--warning {
    color: #FFFFFF;
    background-color: #FFC107;
    border-color: #FFC107;

    &:hover,
    &:focus {
      background: #FFD54F;
      border-color: #FFD54F;
      color: #FFFFFF;
    }

    &:active {
      background: #FFA000;
      border-color: #FFA000;
      color: #FFFFFF;
    }

    &.is-plain {
      color: #FFC107;
      background: #FFF8E1;
      border-color: #FFE082;

      &:hover,
      &:focus {
        background: #FFC107;
        border-color: #FFC107;
        color: #FFFFFF;
      }
    }

    &.is-disabled {
      background: #FFE082;
      border-color: #FFE082;
      color: #FFFFFF;
      opacity: 0.6;
    }
  }

  &--danger {
    color: #FFFFFF;
    background-color: #FF5252;
    border-color: #FF5252;

    &:hover,
    &:focus {
      background: #FF6B6B;
      border-color: #FF6B6B;
      color: #FFFFFF;
    }

    &:active {
      background: #E53935;
      border-color: #E53935;
      color: #FFFFFF;
    }

    &.is-plain {
      color: #FF5252;
      background: #FFEBEE;
      border-color: #FFCDD2;

      &:hover,
      &:focus {
        background: #FF5252;
        border-color: #FF5252;
        color: #FFFFFF;
      }
    }

    &.is-disabled {
      background: #FFB3B3;
      border-color: #FFB3B3;
      color: #FFFFFF;
      opacity: 0.6;
    }
  }

  &--info {
    color: #FFFFFF;
    background-color: #2196F3;
    border-color: #2196F3;

    &:hover,
    &:focus {
      background: #42A5F5;
      border-color: #42A5F5;
      color: #FFFFFF;
    }

    &:active {
      background: #1976D2;
      border-color: #1976D2;
      color: #FFFFFF;
    }

    &.is-plain {
      color: #2196F3;
      background: #E3F2FD;
      border-color: #BBDEFB;

      &:hover,
      &:focus {
        background: #2196F3;
        border-color: #2196F3;
        color: #FFFFFF;
      }
    }
  }

  &--text {
    border-color: transparent;
    color: #FF7D45;
    background: transparent;
    padding-left: 0;
    padding-right: 0;

    &:hover,
    &:focus {
      color: #E86835;
      border-color: transparent;
      background-color: transparent;
    }

    &:active {
      color: #D55E2B;
    }
  }

  // 状态
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;

    &:hover,
    &:focus {
      cursor: not-allowed;
      opacity: 0.5;
      box-shadow: none;
    }
  }

  &.is-loading {
    position: relative;
    pointer-events: none;

    &:before {
      pointer-events: none;
      content: '';
      position: absolute;
      left: -1px;
      top: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: inherit;
      background-color: rgba(255, 255, 255, 0.35);
    }
  }

  // 元素
  &__loading {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;

    .circular {
      width: 14px;
      height: 14px;
      animation: rotate 2s linear infinite;
    }

    .path {
      stroke: currentColor;
      stroke-width: 2;
      stroke-dasharray: 90, 150;
      stroke-dashoffset: 0;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;

    & + .beaver-button__text {
      margin-left: 8px;
    }
  }

  &__text {
    display: inline-flex;
    align-items: center;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
