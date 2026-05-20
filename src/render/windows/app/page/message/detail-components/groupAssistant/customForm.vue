<template>
  <div class="group-assistant-custom">
    <div class="group-assistant-custom__avatar-row" @click="pickAvatar">
      <div class="group-assistant-custom__avatar">
        <BeaverImage v-if="store.form.avatar" :file-name="store.form.avatar" image-class="group-assistant-custom__avatar-image" />
        <span v-else>{{ store.form.name.slice(0, 1) || '机' }}</span>
      </div>
      <span class="group-assistant-custom__avatar-hint">点击设置头像</span>
      <input ref="avatarInputRef" type="file" accept="image/*" class="group-assistant-custom__avatar-input" @change="onAvatarChange">
    </div>
    <label class="group-assistant-custom__field">
      <span class="group-assistant-custom__label">名称</span>
      <input v-model="store.form.name" class="group-assistant-custom__input" type="text" placeholder="如 Jenkins 构建通知">
    </label>
    <label class="group-assistant-custom__field">
      <span class="group-assistant-custom__label">简介</span>
      <textarea v-model="store.form.description" class="group-assistant-custom__textarea" placeholder="机器人用途说明" rows="3" />
    </label>
    <div class="group-assistant-custom__footer">
      <BeaverButton type="primary" :loading="submitting" class="group-assistant-custom__submit" @click="submitCreate">
        添加
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import { createNotificationBotApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { uploadFile } from 'renderModule/utils/upload'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'groupAssistantCustomForm',
  components: { BeaverButton, BeaverImage },
  setup() {
    const store = useGroupAssistantViewStore()
    const submitting = ref(false)
    const avatarInputRef = ref<HTMLInputElement | null>(null)

    const pickAvatar = () => {
      avatarInputRef.value?.click()
    }

    const onAvatarChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file)
        return
      const uploadResult = await uploadFile(file)
      if (uploadResult?.fileKey)
        store.form.avatar = uploadResult.fileKey
    }

    const submitCreate = async () => {
      if (!store.form.name.trim()) {
        Message.error('请填写名称')
        return
      }
      submitting.value = true
      const res = await createNotificationBotApi(store.creatorUserId, {
        groupId: store.groupId,
        name: store.form.name.trim(),
        description: store.form.description.trim(),
        avatar: store.form.avatar,
      })
      submitting.value = false
      if (res.code !== 0)
        return
      store.oneTimeSecret = res.result.secret
      store.notifyListChanged()
      store.openDetail(
        {
          id: res.result.id,
          name: store.form.name.trim(),
          description: store.form.description.trim(),
          avatar: store.form.avatar,
          webhookUrl: res.result.webhookUrl,
          status: 1,
          creatorUserId: store.creatorUserId,
          createdAt: Date.now(),
        },
        store.groupId,
        store.creatorUserId,
      )
      Message.success('添加成功')
    }

    return {
      store,
      submitting,
      avatarInputRef,
      pickAvatar,
      onAvatarChange,
      submitCreate,
    }
  },
})
</script>

<style lang="less" scoped>
.group-assistant-custom {
  .group-assistant-custom__avatar-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .group-assistant-custom__avatar-input {
    display: none;
  }

  .group-assistant-custom__avatar {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    background: #ffe6d9;
    color: #ff7d45;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    overflow: hidden;
  }

  .group-assistant-custom__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .group-assistant-custom__avatar-hint {
    margin-left: 12px;
    font-size: 13px;
    color: #636e72;
  }

  .group-assistant-custom__field {
    display: block;
    margin-bottom: 16px;
  }

  .group-assistant-custom__label {
    display: block;
    font-size: 13px;
    color: #636e72;
    margin-bottom: 6px;
  }

  .group-assistant-custom__input,
  .group-assistant-custom__textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: #ff7d45;
    }
  }

  .group-assistant-custom__footer {
    margin-top: 8px;
  }

  .group-assistant-custom__submit {
    width: 100%;
  }
}
</style>
