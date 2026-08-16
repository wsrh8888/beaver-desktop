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
        <label class="circle-modal-label">圈子头像</label>
        <div class="circle-modal-avatar" @click="triggerAvatarInput">
          <BeaverImage
            v-if="avatar"
            :file-name="avatar"
            alt="圈子头像"
            image-class="circle-modal-avatar-image"
          />
          <div v-else class="circle-modal-avatar-placeholder">
            <img src="renderModule/assets/image/common/add.svg" alt="上传">
            <span>上传头像</span>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="circle-modal-avatar-input"
            @change="onAvatarInputChange"
          >
        </div>

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
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { createCircleApi } from 'renderModule/api/circle'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { uploadFile } from 'renderModule/utils/upload'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleCreateModal',
  components: { BeaverImage },
  emits: ['close', 'success'],
  setup(_props, { emit }) {
    const name = ref('')
    const description = ref('')
    const avatar = ref('')
    const submitting = ref(false)
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const circleStore = useCircleStore()

    const canSubmit = computed(() => !!name.value.trim() && !!avatar.value)

    const handleClose = () => {
      emit('close')
    }

    const triggerAvatarInput = () => {
      avatarInputRef.value?.click()
    }

    const onAvatarInputChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file)
        return
      const uploadResult = await uploadFile(file)
      if (uploadResult?.fileUrl) {
        avatar.value = uploadResult.fileUrl
      }
      else {
        Message.error('头像上传失败，请重试')
      }
      if (avatarInputRef.value)
        avatarInputRef.value.value = ''
    }

    const handleSubmit = async () => {
      if (!canSubmit.value || submitting.value)
        return
      submitting.value = true
      const res = await createCircleApi({
        name: name.value.trim(),
        description: description.value.trim(),
        avatar: avatar.value,
        joinType: 0,
      })
      submitting.value = false
      if (res.code !== 0) {
        Message.error(res.msg || '创建圈子失败')
        return
      }
      await circleStore.loadMyCircles()
      const circleId = res.result.circleId
      name.value = ''
      description.value = ''
      avatar.value = ''
      emit('success', circleId)
      emit('close')
    }

    return {
      name,
      description,
      avatar,
      submitting,
      canSubmit,
      avatarInputRef,
      handleClose,
      triggerAvatarInput,
      onAvatarInputChange,
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

.circle-modal-avatar {
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #F9FAFB;
  border: 1px dashed #D8DEE6;
}

.circle-modal-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-modal-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #636E72;
  font-size: 12px;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
}

.circle-modal-avatar-input {
  display: none;
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
