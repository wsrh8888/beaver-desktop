<template>
  <div class="profile-overlay" @click.self="handleClose">
    <div class="profile-panel" @click.stop>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-title">
          个人资料
        </div>
        <BeaverButton type="text" circle class="close-btn" @click="handleClose">
          <template #icon>
            <img src="renderModule/assets/image/common/close.svg" alt="关闭">
          </template>
        </BeaverButton>
      </div>

      <!-- 内容区域 -->
      <div class="panel-content">
        <!-- 头像区域（顶部居中） -->
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
              rows="2"
            />
          </div>

          <!-- 邮箱 -->
          <div class="form-item">
            <div class="form-label">
              邮箱
            </div>
            <input
              v-model="formData.email"
              class="form-input"
              type="email"
              readonly
            >
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
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="panel-footer">
        <BeaverButton type="default" @click="handleClose">
          取消
        </BeaverButton>
        <BeaverButton type="primary" :loading="isSaving" @click="handleSave">
          保存
        </BeaverButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import cameraIcon from 'renderModule/assets/image/leftBar/settings/camera.svg'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { uploadFile } from 'renderModule/utils/upload'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'ProfileComponent',
  components: {
    BeaverImage,
    BeaverButton,
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

    // 表单数据（只包含数据库中存在的字段）
    const formData = ref({
      avatar: userStore.getUserInfo.avatar || '',
      nickName: userStore.getUserInfo.nickName || '',
      abstract: userStore.getUserInfo.abstract || '',
      email: userStore.getUserInfo.email || '',
      gender: genderReverseMap[userStore.getUserInfo.gender] || 'unknown',
    })

    // 监听用户信息变化
    watch(() => userStore.getUserInfo, (newInfo) => {
      formData.value = {
        avatar: newInfo.avatar || '',
        nickName: newInfo.nickName || '',
        abstract: newInfo.abstract || '',
        email: newInfo.email || '',
        gender: genderReverseMap[newInfo.gender] || 'unknown',
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
        // 上传头像文件
        const uploadResult = await uploadFile(file)
        if (uploadResult && uploadResult.fileKey) {
          formData.value.avatar = uploadResult.fileKey
          Message.success('头像上传成功')
        }
        else {
          Message.error('头像上传失败，请重试')
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
          avatar: formData.value.avatar, // 后端使用 fileName 字段
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
.profile-overlay {
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

.profile-panel {
  width: 560px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px; // 按照规范：间距使用8px基础单位
  border-bottom: 1px solid #EBEEF5;

  .header-title {
    font-size: 16px; // 按照规范：标题16px
    font-weight: 500; // 按照规范：中粗500
    color: #2D3436; // 按照规范：标题文本色
  }

  .close-btn {
    width: 32px;
    height: 32px;
    padding: 0;

    :deep(img) {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
  }
}

.panel-content {
  flex: 1;
  padding: 32px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;

  .avatar-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
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
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 20px;
          height: 20px;
          filter: brightness(0) invert(1);
        }
      }

      .avatar-text {
        color: #FFFFFF;
        font-size: 11px;
      }
    }
  }
}

.form-section {
  .form-item {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      width: 80px;
      flex-shrink: 0;
      font-size: 14px;
      font-weight: 500;
      color: #2D3436;
      text-align: right;
      padding-right: 16px;
    }

    .form-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 13px;
      color: #2D3436;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: #FF7D45;
      }

      &:read-only {
        background: #F8F9FA;
        color: #636E72;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .form-textarea {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #EBEEF5;
      border-radius: 6px;
      font-size: 13px;
      color: #2D3436;
      resize: none;
      transition: border-color 0.2s;
      font-family: inherit;
      line-height: 1.5;

      &:focus {
        outline: none;
        border-color: #FF7D45;
      }

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .form-radio-group {
      flex: 1;
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
  padding: 16px 24px;
  border-top: 1px solid #EBEEF5;
  flex-shrink: 0;
}
</style>
