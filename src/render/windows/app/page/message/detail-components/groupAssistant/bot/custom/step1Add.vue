<template>
  <div class="bot-custom-add">
    <div class="bot-custom-add__header">
      <div class="bot-custom-add__avatar-row" @click="handleAvatarClick">
        <img v-if="formAvatar" :src="formAvatar" class="bot-custom-add__avatar" alt="">
        <img v-else :src="defaultAvatar" class="bot-custom-add__avatar" alt="">
        <span class="bot-custom-add__edit-badge">
          <img src="renderModule/assets/image/groupAssistant/edit.svg" alt="">
        </span>
      </div>
      <input ref="avatarInputRef" type="file" accept="image/*" class="bot-custom-add__avatar-input" @change="onAvatarChange">
    </div>

    <div class="bot-custom-add__desc">
      <h3>第一步：添加自定义机器人进群</h3>
      <p>自定义机器人可以通过 webhook 向群聊推送来自外部服务的消息。请填写以下信息完成添加。查看 <a href="javascript:void(0)">配置说明</a></p>
    </div>

    <label class="bot-custom-add__field">
      <span class="bot-custom-add__label">* 名称</span>
      <input v-model="formName" class="bot-custom-add__input" type="text" placeholder="自定义机器人">
    </label>

    <label class="bot-custom-add__field">
      <span class="bot-custom-add__label">* 简介</span>
      <textarea v-model="formDescription" class="bot-custom-add__textarea" rows="4" placeholder="请简要描述机器人提供的产品或服务" maxlength="200" />
      <span class="bot-custom-add__counter">{{ formDescription.length }} / 200</span>
    </label>

    <div class="bot-custom-add__footer">
      <BeaverButton @click="handleCancel">
        取消
      </BeaverButton>
      <BeaverButton type="primary" :loading="submitting" @click="submitCreate">
        添加
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import { createBotApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import Message from 'renderModule/components/ui/message'
import { uploadFile } from 'renderModule/utils/upload'
import { botTemplateOptions } from '../../config'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { defineComponent, ref } from 'vue'

const customTemplate = botTemplateOptions.find(item => item.key === 'custom')!

export default defineComponent({
  name: 'botCustomAdd',
  components: { BeaverButton },
  emits: ['close', 'created'],
  setup(_, { emit }) {
    const groupAssistantViewStore = useGroupAssistantViewStore()
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const submitting = ref(false)
    const formName = ref('')
    const formDescription = ref('')
    const formAvatar = ref('') // 存储完整的 fileUrl

    const defaultAvatar = customTemplate.avatar

    const handleAvatarClick = () => {
      avatarInputRef.value?.click()
    }

    const onAvatarChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file)
        return
      const result = await uploadFile(file)
      if (result?.fileUrl)
        formAvatar.value = result.fileUrl
    }

    const submitCreate = async () => {
      if (!formName.value.trim()) {
        Message.error('请填写名称')
        return
      }
      submitting.value = true
      const res = await createBotApi({
        groupId: groupAssistantViewStore.groupId,
        name: formName.value.trim(),
        description: formDescription.value.trim(),
        avatar: formAvatar.value, // 直接传递 fileUrl
        type: 'custom',
      })
      submitting.value = false
      if (res.code !== 0)
        return
      Message.success('添加成功')
      emit('created', res.result.botId)
    }

    const handleCancel = () => {
      emit('close')
    }

    return {
      avatarInputRef,
      submitting,
      formName,
      formDescription,
      formAvatar,
      defaultAvatar,
      handleAvatarClick,
      onAvatarChange,
      submitCreate,
      handleCancel,
    }
  },
})
</script>

<style lang="less" scoped>
.bot-custom-add {
  padding: 20px;

  .bot-custom-add__header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
    position: relative;

    .bot-custom-add__avatar-row {
      position: relative;
      cursor: pointer;

      &:hover .bot-custom-add__edit-badge {
        opacity: 1;
      }
    }

    .bot-custom-add__avatar-input {
      display: none;
    }

    .bot-custom-add__avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .bot-custom-add__edit-badge {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 24px;
      height: 24px;
      background: #2d8cf0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s;

      img {
        width: 14px;
        height: 14px;
      }
    }
  }

  .bot-custom-add__desc {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #333;
    }

    p {
      font-size: 13px;
      color: #999;
      line-height: 1.6;

      a {
        color: #2d8cf0;
        text-decoration: none;
      }
    }
  }

  .bot-custom-add__field {
    display: block;
    margin-bottom: 20px;
  }

  .bot-custom-add__label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  .bot-custom-add__input,
  .bot-custom-add__textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: #2d8cf0;
    }
  }

  .bot-custom-add__textarea {
    resize: none;
  }

  .bot-custom-add__counter {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .bot-custom-add__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
