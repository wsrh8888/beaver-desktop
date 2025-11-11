<template>
  <div class="settings-overlay" @click.self="handleClose">
    <div class="settings-panel" @click.stop>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-title">
          编辑资料
        </div>
        <button class="close-btn" @click="handleClose">
          <img src="renderModule/assets/image/common/close.svg" alt="关闭">
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="panel-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="handleAvatarClick">
            <BeaverImage
              :file-name="formData.avatar"
              :cache-type="CacheType.USER_AVATAR"
              image-class="avatar-image"
            />
            <div class="avatar-overlay">
              <div class="avatar-icon">
                <img :src="cameraIcon" alt="更换头像">
              </div>
              <div class="avatar-text">
                更换头像
              </div>
            </div>
          </div>
          <input ref="avatarInputRef" type="file" accept="image/*" style="display: none" @change="handleAvatarChange">
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <!-- 昵称 -->
          <div class="form-item">
            <div class="form-label">
              昵称
            </div>
            <input
              v-model="formData.nickName"
              class="form-input"
              type="text"
              placeholder="请输入昵称"
              maxlength="20"
            >
          </div>

          <!-- 个性签名 -->
          <div class="form-item">
            <div class="form-label">
              个性签名
            </div>
            <textarea
              v-model="formData.abstract"
              class="form-textarea"
              placeholder="请输入个性签名"
              maxlength="100"
              rows="3"
            />
          </div>

          <!-- 性别 -->
          <div class="form-item">
            <div class="form-label">
              性别
            </div>
            <div class="form-radio-group">
              <label class="radio-item" :class="{ active: formData.gender === 'male' }">
                <input v-model="formData.gender" type="radio" value="male" style="display: none">
                <span class="radio-label">男</span>
              </label>
              <label class="radio-item" :class="{ active: formData.gender === 'female' }">
                <input v-model="formData.gender" type="radio" value="female" style="display: none">
                <span class="radio-label">女</span>
              </label>
              <label class="radio-item" :class="{ active: formData.gender === 'unknown' }">
                <input v-model="formData.gender" type="radio" value="unknown" style="display: none">
                <span class="radio-label">保密</span>
              </label>
            </div>
          </div>

          <!-- 生日 -->
          <div class="form-item">
            <div class="form-label">
              生日
            </div>
            <input
              v-model="formData.birthday"
              class="form-input"
              type="date"
            >
          </div>

          <!-- 地区 -->
          <div class="form-item">
            <div class="form-label">
              地区
            </div>
            <input
              v-model="formData.region"
              class="form-input"
              type="text"
              placeholder="请输入地区"
            >
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="panel-footer">
          <button class="btn btn-cancel" @click="handleClose">
            取消
          </button>
          <button class="btn btn-save" :disabled="isSaving" @click="handleSave">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { useUserStore } from 'renderModule/app/pinia/user/user'
import cameraIcon from 'renderModule/assets/image/leftBar/settings/camera.svg'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { selectAndUploadFile } from 'renderModule/utils/upload'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'SettingsComponent',
  components: {
    BeaverImage,
  },
  emits: ['close'],
  setup(_props, { emit }) {
    const userStore = useUserStore()
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const isSaving = ref(false)

    // 性别映射：0-未知 1-男 2-女
    const genderMap = {
      unknown: 0,
      male: 1,
      female: 2,
    }

    const genderReverseMap: Record<number, 'unknown' | 'male' | 'female'> = {
      0: 'unknown',
      1: 'male',
      2: 'female',
    }

    // 表单数据
    const formData = ref({
      avatar: userStore.userInfo.avatar || '',
      nickName: userStore.userInfo.nickName || '',
      abstract: userStore.userInfo.abstract || '',
      gender: genderReverseMap[userStore.userInfo.gender] || 'unknown',
      birthday: '', // 本地扩展字段，不保存到后端
      region: '', // 本地扩展字段，不保存到后端
    })

    // 监听用户信息变化
    watch(() => userStore.userInfo, (newInfo) => {
      formData.value = {
        avatar: newInfo.avatar || '',
        nickName: newInfo.nickName || '',
        abstract: newInfo.abstract || '',
        gender: genderReverseMap[newInfo.gender] || 'unknown',
        birthday: '',
        region: '',
      }
    }, { deep: true })

    // 点击头像
    const handleAvatarClick = () => {
      avatarInputRef.value?.click()
    }

    // 头像文件变化
    const handleAvatarChange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file)
        return

      try {
        // 上传头像
        const uploadResults = await selectAndUploadFile('image/*', false)
        if (uploadResults.length > 0) {
          formData.value.avatar = uploadResults[0].fileKey
        }
      }
      catch (error) {
        console.error('头像上传失败:', error)
        Message.error('头像上传失败，请重试')
      }
      finally {
        // 清空 input，以便可以重复选择同一文件
        if (avatarInputRef.value) {
          avatarInputRef.value.value = ''
        }
      }
    }

    // 保存
    const handleSave = async () => {
      if (isSaving.value)
        return

      try {
        isSaving.value = true

        // 构建更新数据（只包含后端支持的字段）
        const updateData = {
          nickName: formData.value.nickName,
          fileName: formData.value.avatar, // 后端使用 fileName 字段
          abstract: formData.value.abstract,
          gender: genderMap[formData.value.gender],
        }

        // 更新用户信息
        const success = await userStore.updateUserInfo(updateData)

        if (success) {
          Message.success('保存成功')
          // 关闭弹窗
          emit('close')
        }
        else {
          Message.error('保存失败，请重试')
        }
      }
      catch (error) {
        console.error('保存失败:', error)
        Message.error('保存失败，请重试')
      }
      finally {
        isSaving.value = false
      }
    }

    // 关闭
    const handleClose = () => {
      emit('close')
    }

    return {
      CacheType,
      cameraIcon,
      formData,
      avatarInputRef,
      isSaving,
      handleAvatarClick,
      handleAvatarChange,
      handleSave,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.settings-panel {
  width: 600px;
  max-height: 80vh;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #EBEEF5;

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #2D3436;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background: #F5F5F5;
    }

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;

  .avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);

      .avatar-overlay {
        opacity: 1;
      }
    }

    :deep(.avatar-image) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;

      .avatar-icon {
        color: #FFFFFF;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
        }
      }

      .avatar-text {
        color: #FFFFFF;
        font-size: 12px;
      }
    }
  }
}

.form-section {
  .form-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #2D3436;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 14px;
      color: #2D3436;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: #FF7D45;
      }

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .form-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 14px;
      color: #2D3436;
      resize: vertical;
      transition: border-color 0.2s;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #FF7D45;
      }

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .form-radio-group {
      display: flex;
      gap: 16px;

      .radio-item {
        padding: 8px 20px;
        border: 1px solid #EBEEF5;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #FF7D45;
        }

        &.active {
          border-color: #FF7D45;
          background: rgba(255, 125, 69, 0.1);
          color: #FF7D45;
        }

        .radio-label {
          font-size: 14px;
          user-select: none;
        }
      }
    }
  }
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #EBEEF5;
  margin-top: 24px;

  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &.btn-cancel {
      background: #F5F5F5;
      color: #636E72;

      &:hover {
        background: #EBEEF5;
      }
    }

    &.btn-save {
      background: #FF7D45;
      color: #FFFFFF;

      &:hover:not(:disabled) {
        background: #FF6B2E;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
