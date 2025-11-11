<template>
  <Transition name="messagebox-fade">
    <div v-if="visible" class="messagebox-overlay" @click="handleOverlayClick">
      <div class="messagebox-wrapper" @click.stop>
        <div class="messagebox" :class="{ 'is-center': center }">
          <!-- 关闭按钮 -->
          <button v-if="showClose" class="messagebox-close" @click="handleCancel">
            <img :src="closeIcon" alt="关闭">
          </button>

          <!-- 图标 -->
          <div v-if="type" class="messagebox-icon" :class="`messagebox-icon--${type}`">
            <img
              v-if="type === 'success'"
              :src="successIcon"
              alt="成功"
            >
            <img
              v-else-if="type === 'warning'"
              :src="warningIcon"
              alt="警告"
            >
            <img
              v-else-if="type === 'error'"
              :src="errorIcon"
              alt="错误"
            >
            <img
              v-else
              :src="infoIcon"
              alt="信息"
            >
          </div>

          <!-- 标题 -->
          <div v-if="title" class="messagebox-title">
            {{ title }}
          </div>

          <!-- 内容 -->
          <div class="messagebox-content">
            <div v-if="dangerouslyUseHTMLString" v-html="message" />
            <div v-else>
              {{ message }}
            </div>
          </div>

          <!-- 输入框（prompt 模式） -->
          <div v-if="isPrompt" class="messagebox-input">
            <input
              ref="inputRef"
              v-model="inputValue"
              type="text"
              class="messagebox-input-inner"
              :placeholder="inputPlaceholder"
            >
            <div v-if="inputErrorMessage" class="messagebox-input-error">
              {{ inputErrorMessage }}
            </div>
          </div>

          <!-- 按钮 -->
          <div class="messagebox-buttons">
            <button
              v-if="showCancelButton"
              class="messagebox-button messagebox-cancel"
              :class="{ 'is-round': roundButton }"
              @click="handleCancel"
            >
              {{ cancelButtonText }}
            </button>
            <button
              v-if="showConfirmButton"
              class="messagebox-button messagebox-confirm"
              :class="{ [`messagebox-confirm--${type}`]: type, 'is-round': roundButton }"
              @click="handleConfirm"
            >
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import closeIcon from './assets/close.svg'
import errorIcon from './assets/error.svg'
import infoIcon from './assets/info.svg'
import successIcon from './assets/success.svg'
import warningIcon from './assets/warning.svg'

export default defineComponent({
  name: 'MessageBox',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String as () => 'success' | 'warning' | 'info' | 'error' | undefined,
      default: undefined,
    },
    confirmButtonText: {
      type: String,
      default: '确定',
    },
    cancelButtonText: {
      type: String,
      default: '取消',
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
    showConfirmButton: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    dangerouslyUseHTMLString: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    roundButton: {
      type: Boolean,
      default: false,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    inputType: {
      type: String,
      default: 'text',
    },
    inputPlaceholder: {
      type: String,
      default: '',
    },
    inputValidator: {
      type: Function,
      default: null,
    },
    inputErrorMessage: {
      type: String,
      default: '',
    },
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const inputValue = ref('')
    const inputErrorMessage = ref('')

    const isPrompt = props.inputType !== undefined && props.inputType !== null

    // 处理确认
    const handleConfirm = () => {
      if (isPrompt) {
        // 验证输入
        if (props.inputValidator) {
          const result = props.inputValidator(inputValue.value)
          if (result === false) {
            inputErrorMessage.value = props.inputErrorMessage || '输入验证失败'
            return
          }
          if (typeof result === 'string') {
            inputErrorMessage.value = result
            return
          }
        }
        emit('confirm', inputValue.value)
      }
      else {
        emit('confirm')
      }
    }

    // 处理取消
    const handleCancel = () => {
      emit('cancel')
    }

    // 处理遮罩层点击
    const handleOverlayClick = () => {
      if (props.closeOnClickModal) {
        handleCancel()
      }
    }

    // 处理 ESC 键
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.closeOnPressEscape) {
        handleCancel()
      }
    }

    // 监听 visible，自动聚焦输入框
    watch(() => props.visible, (newVal) => {
      if (newVal && isPrompt) {
        nextTick(() => {
          inputRef.value?.focus()
        })
      }
    })

    onMounted(() => {
      document.addEventListener('keydown', handleEscape)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscape)
    })

    return {
      closeIcon,
      successIcon,
      warningIcon,
      errorIcon,
      infoIcon,
      inputRef,
      inputValue,
      inputErrorMessage,
      isPrompt,
      handleConfirm,
      handleCancel,
      handleOverlayClick,
    }
  },
})
</script>

<style lang="less" scoped>
.messagebox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
}

.messagebox-wrapper {
  position: relative;
}

.messagebox {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 24px;
  min-width: 420px;
  max-width: 90vw;
  position: relative;

  &.is-center {
    text-align: center;
  }
}

.messagebox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: all 0.2s;

  &:hover {
    background: #F5F7FA;
    color: #606266;
  }

  img {
    width: 16px;
    height: 16px;
  }
}

.messagebox-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;

  img {
    width: 24px;
    height: 24px;
  }

  &--success {
    background: #F0F9FF;
    color: #67C23A;
  }

  &--warning {
    background: #FDF6EC;
    color: #E6A23C;
  }

  &--error {
    background: #FEF0F0;
    color: #F56C6C;
  }

  &--info {
    background: #F4F4F5;
    color: #909399;
  }
}

.messagebox-title {
  font-size: 18px;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 12px;
  padding-left: 0;
  padding-right: 0;
}

.messagebox-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.5;
}

.messagebox-input {
  margin-bottom: 20px;

  .messagebox-input-inner {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #FF7D45;
    }
  }

  .messagebox-input-error {
    color: #F56C6C;
    font-size: 12px;
    margin-top: 4px;
  }
}

.messagebox-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.messagebox-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.is-round {
    border-radius: 20px;
  }

  &.messagebox-cancel {
    background: #FFFFFF;
    color: #606266;
    border: 1px solid #DCDFE6;

    &:hover {
      color: #FF7D45;
      border-color: #FF7D45;
    }
  }

  &.messagebox-confirm {
    background: #FF7D45;
    color: #FFFFFF;

    &:hover {
      background: #FF6B2E;
    }

    &--success {
      background: #67C23A;

      &:hover {
        background: #5DAE34;
      }
    }

    &--warning {
      background: #E6A23C;

      &:hover {
        background: #CF9236;
      }
    }

    &--error {
      background: #F56C6C;

      &:hover {
        background: #DD6161;
      }
    }
  }
}

// 动画
.messagebox-fade-enter-active,
.messagebox-fade-leave-active {
  transition: opacity 0.3s;
}

.messagebox-fade-enter-active .messagebox-wrapper,
.messagebox-fade-leave-active .messagebox-wrapper {
  transition: transform 0.3s;
}

.messagebox-fade-enter-from {
  opacity: 0;

  .messagebox-wrapper {
    transform: scale(0.9);
  }
}

.messagebox-fade-leave-to {
  opacity: 0;

  .messagebox-wrapper {
    transform: scale(0.9);
  }
}
</style>
