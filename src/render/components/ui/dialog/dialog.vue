<template>
  <div class="modal" :class="{ active: modelValue }" @click="handleBackdropClick">
    <div class="modal-content" :style="{ width }">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="handleClose">
          <img src="./close.svg" alt="close">
        </button>
      </div>

      <div class="modal-body">
        <slot />
      </div>

      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BeaverDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      default: '720px',
    },

    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget && (props.closeOnClickModal)) {
        handleClose()
      }
    }

    return {
      handleClose,
      handleBackdropClick,
    }
  },
})
</script>

<style lang="less" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1);

  &.active {
    opacity: 1;
    visibility: visible;
  }

  .modal-content {
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }

  .modal-header {
    height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEEF5;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #2D3436;
    }

    .close-button {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      img {
        width: 20px;
        height: 20px;
      }
    }
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .modal-footer {
    height: 72px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid #EBEEF5;
  }
}
</style>
