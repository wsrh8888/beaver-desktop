<template>
  <transition name="message-fade" appear>
    <div
      v-if="visible"
      class="message" :class="[
        `message--${type}`,
        { 'message--center': center },
      ]"
      :style="{ zIndex }"
    >
      <div class="message__icon">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z" />
        </svg>
        <svg v-else-if="type === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64zm67.2 275.072c0-12.9-4.48-23.744-13.44-32.256s-20.096-12.8-33.28-12.8-24.32 4.224-33.28 12.8-13.44 19.456-13.44 32.256c0 13.056 4.48 23.872 13.44 32.32s20.096 12.672 33.28 12.672 24.32-4.224 33.28-12.672S579.2 352.128 579.2 339.072zM454.656 644.736c0 14.592 4.352 26.048 13.056 34.368s20.992 12.48 37.12 12.48c15.616 0 27.776-4.16 36.48-12.48s13.056-19.776 13.056-34.368V423.936c0-14.336-4.352-25.728-13.056-34.176s-20.864-12.672-36.48-12.672c-16.128 0-28.416 4.224-37.12 12.672s-13.056 19.84-13.056 34.176v220.8z" />
        </svg>
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z" />
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336L512 457.664z" />
        </svg>
      </div>
      <div class="message__content">
        <p v-if="!dangerouslyUseHTMLString" class="message__text">
          {{ message }}
        </p>
        <p v-else class="message__text" v-html="message" />
      </div>
      <div v-if="showClose" class="message__close" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
        </svg>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'

export type MessageType = 'success' | 'warning' | 'info' | 'error'

export default defineComponent({
  name: 'Message',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String as PropType<MessageType>,
      default: 'info',
    },
    duration: {
      type: Number,
      default: 3000,
    },
    showClose: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    dangerouslyUseHTMLString: {
      type: Boolean,
      default: false,
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    onClose: {
      type: Function,
      default: null,
    },
  },
  emits: ['destroy'],
  setup(props, { emit }) {
    const visible = ref(false)
    let timer: NodeJS.Timeout | null = null

    const startTimer = () => {
      if (props.duration > 0) {
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    }

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    const close = () => {
      visible.value = false
      clearTimer()
      props.onClose?.()
      // 延迟销毁，等待动画完成
      setTimeout(() => {
        emit('destroy')
      }, 300)
    }

    const handleMouseEnter = () => {
      clearTimer()
    }

    const handleMouseLeave = () => {
      startTimer()
    }

    onMounted(() => {
      visible.value = true
      startTimer()
    })

    return {
      visible,
      close,
      handleMouseEnter,
      handleMouseLeave,
    }
  },
})
</script>

<style lang="less" scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  min-width: 380px;
  padding: 15px 20px;
  border-radius: 6px;
  background-color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #EBEEF5;
  overflow: hidden;
  cursor: pointer;

  &--center {
    justify-content: center;
  }

  &--success {
    background-color: #F1F8E9;
    border-color: #4CAF50;

    .message__icon {
      color: #4CAF50;
    }

    .message__text {
      color: #2E7D32;
    }
  }

  &--warning {
    background-color: #FFF8E1;
    border-color: #FFC107;

    .message__icon {
      color: #FF8F00;
    }

    .message__text {
      color: #E65100;
    }
  }

  &--info {
    background-color: #E3F2FD;
    border-color: #2196F3;

    .message__icon {
      color: #2196F3;
    }

    .message__text {
      color: #1565C0;
    }
  }

  &--error {
    background-color: #FFEBEE;
    border-color: #FF5252;

    .message__icon {
      color: #FF5252;
    }

    .message__text {
      color: #C62828;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    margin-right: 10px;
    font-size: 16px;

    svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  }

  &__content {
    flex: 1;

    .message__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #636E72;
    }
  }

  &__close {
    margin-left: 15px;
    cursor: pointer;
    color: #B2BEC3;
    font-size: 16px;

    &:hover {
      color: #636E72;
    }

    svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
  }
}

.message-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>
