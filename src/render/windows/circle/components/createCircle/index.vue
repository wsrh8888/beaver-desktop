<template>
  <div class="circle-modal-mask" @click="handleClose">
    <div class="circle-modal" @click.stop>
      <div class="circle-modal-header">
        <h3>创建圈子</h3>
        <button class="circle-modal-close" type="button" @click="handleClose">
          <img src="renderModule/assets/image/header/close.svg" alt="关闭">
        </button>
      </div>
      <div class="circle-modal-body">
        <label class="circle-modal-label">圈子名称</label>
        <input v-model="name" class="circle-modal-input" maxlength="32" placeholder="例如：前端交流圈">
        <label class="circle-modal-label">圈子简介</label>
        <textarea
          v-model="description"
          class="circle-modal-textarea"
          maxlength="200"
          placeholder="介绍一下这个圈子..."
        />
      </div>
      <div class="circle-modal-footer">
        <button class="circle-modal-btn ghost" type="button" @click="handleClose">
          取消
        </button>
        <button
          class="circle-modal-btn primary"
          type="button"
          :disabled="!name.trim() || submitting"
          @click="handleSubmit"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleCreateModal',
  setup() {
    const circleStore = useCircleStore()
    const name = ref('')
    const description = ref('')
    const submitting = ref(false)

    const handleClose = () => {
      circleStore.closeCreateCircle()
    }

    const handleSubmit = async () => {
      if (!name.value.trim() || submitting.value)
        return
      submitting.value = true
      await circleStore.createCircle(name.value, description.value)
      submitting.value = false
      name.value = ''
      description.value = ''
    }

    return {
      name,
      description,
      submitting,
      handleClose,
      handleSubmit,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.circle-modal {
  width: 420px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.circle-modal-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EBEEF5;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }
}

.circle-modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
  }
}

.circle-modal-body {
  padding: 20px;
}

.circle-modal-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2D3436;
}

.circle-modal-input,
.circle-modal-textarea {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  font-size: 13px;
  color: #2D3436;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #FF7D45;
    box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.12);
  }
}

.circle-modal-input {
  height: 36px;
  padding: 0 12px;
}

.circle-modal-textarea {
  min-height: 96px;
  padding: 12px;
  resize: vertical;
}

.circle-modal-footer {
  padding: 16px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.circle-modal-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &.ghost {
    border: 1px solid #EBEEF5;
    background: #FFFFFF;
    color: #636E72;
  }

  &.primary {
    border: none;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: #FFFFFF;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
