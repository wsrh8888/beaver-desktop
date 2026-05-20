<template>
  <div v-if="activeBot" class="group-assistant-detail">
    <div class="group-assistant-detail__head">
      <div class="group-assistant-detail__avatar">
        <BeaverImage v-if="store.form.avatar" :file-name="store.form.avatar" image-class="group-assistant-detail__avatar-image" />
        <span v-else>{{ store.form.name.slice(0, 1) }}</span>
      </div>
      <div class="group-assistant-detail__fields">
        <input v-model="store.form.name" class="group-assistant-detail__input" type="text">
        <textarea v-model="store.form.description" class="group-assistant-detail__textarea" rows="2" />
      </div>
    </div>

    <div v-if="oneTimeSecret" class="group-assistant-detail__secret">
      <div class="group-assistant-detail__secret-label">
        签名密钥（仅显示一次，请立即保存）
      </div>
      <div class="group-assistant-detail__secret-value">
        {{ oneTimeSecret }}
      </div>
      <BeaverButton size="small" @click="copyText(oneTimeSecret)">
        复制密钥
      </BeaverButton>
    </div>

    <label class="group-assistant-detail__field">
      <span class="group-assistant-detail__label">Webhook 地址</span>
      <div class="group-assistant-detail__copy-row">
        <input class="group-assistant-detail__input group-assistant-detail__input--readonly" type="text" readonly :value="activeBot.webhookUrl">
        <BeaverButton size="small" @click="copyText(activeBot.webhookUrl)">
          复制
        </BeaverButton>
      </div>
    </label>

    <div class="group-assistant-detail__row">
      <span>是否启用</span>
      <label class="group-assistant-detail__switch">
        <input v-model="enabled" type="checkbox" @change="saveStatus">
        <span class="group-assistant-detail__switch-slider" />
      </label>
    </div>

    <div class="group-assistant-detail__field">
      <span class="group-assistant-detail__label">添加者</span>
      <span class="group-assistant-detail__value">{{ activeBot.creatorUserId || '—' }}</span>
    </div>

    <div class="group-assistant-detail__security">
      <div class="group-assistant-detail__security-title">
        安全设置
      </div>
      <div class="group-assistant-detail__security-item group-assistant-detail__security-item--active">
        <span>签名校验</span>
        <span class="group-assistant-detail__tag">已开启</span>
      </div>
      <div class="group-assistant-detail__security-item">
        <span>自定义关键字</span>
        <span class="group-assistant-detail__tag group-assistant-detail__tag--muted">即将支持</span>
      </div>
      <div class="group-assistant-detail__security-item">
        <span>IP 白名单</span>
        <span class="group-assistant-detail__tag group-assistant-detail__tag--muted">即将支持</span>
      </div>
    </div>

    <div class="group-assistant-detail__footer">
      <BeaverButton type="danger" @click="handleDelete">
        删除
      </BeaverButton>
      <BeaverButton @click="handleResetSecret">
        重置密钥
      </BeaverButton>
      <BeaverButton type="primary" :loading="saving" @click="saveDetail">
        保存
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import {
  deleteNotificationBotApi,
  resetNotificationBotSecretApi,
  updateNotificationBotApi,
} from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import MessageBox from 'renderModule/components/ui/messagebox'
import { copyToClipboard } from '../../right-component/content/utils/copy'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'groupAssistantDetail',
  components: { BeaverButton, BeaverImage },
  setup() {
    const store = useGroupAssistantViewStore()
    const saving = ref(false)

    const activeBot = computed(() => store.activeBot)
    const oneTimeSecret = computed(() => store.oneTimeSecret)
    const enabled = computed({
      get: () => store.enabled,
      set: (v: boolean) => { store.enabled = v },
    })

    const saveDetail = async () => {
      if (!activeBot.value)
        return
      saving.value = true
      const res = await updateNotificationBotApi(store.creatorUserId, {
        id: activeBot.value.id,
        name: store.form.name.trim(),
        description: store.form.description.trim(),
        avatar: store.form.avatar,
      })
      saving.value = false
      if (res.code === 0) {
        Message.success('已保存')
        store.notifyListChanged()
      }
    }

    const saveStatus = async () => {
      if (!activeBot.value)
        return
      const res = await updateNotificationBotApi(store.creatorUserId, {
        id: activeBot.value.id,
        status: enabled.value ? 1 : 0,
      })
      if (res.code === 0)
        store.notifyListChanged()
    }

    const handleResetSecret = async () => {
      if (!activeBot.value)
        return
      await MessageBox.confirm('重置后旧密钥立即失效，需同步更新 Jenkins 配置', '重置密钥')
      const res = await resetNotificationBotSecretApi(store.creatorUserId, { id: activeBot.value.id })
      if (res.code === 0) {
        store.oneTimeSecret = res.result.secret
        Message.success('密钥已重置')
      }
    }

    const handleDelete = async () => {
      if (!activeBot.value)
        return
      await MessageBox.confirm('删除后 Webhook 将不可用', '删除机器人')
      const res = await deleteNotificationBotApi(store.creatorUserId, { id: activeBot.value.id })
      if (res.code === 0) {
        Message.success('已删除')
        store.notifyListChanged()
        store.close()
      }
    }

    const copyText = async (text: string) => {
      const ok = await copyToClipboard(text)
      if (ok)
        Message.success('已复制')
    }

    return {
      store,
      activeBot,
      oneTimeSecret,
      enabled,
      saving,
      saveDetail,
      saveStatus,
      handleResetSecret,
      handleDelete,
      copyText,
    }
  },
})
</script>

<style lang="less" scoped>
.group-assistant-detail {
  .group-assistant-detail__head {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .group-assistant-detail__avatar {
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
    flex-shrink: 0;
  }

  .group-assistant-detail__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .group-assistant-detail__fields {
    flex: 1;
    min-width: 0;
  }

  .group-assistant-detail__input,
  .group-assistant-detail__textarea {
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

  .group-assistant-detail__input--readonly {
    background: #f9fafb;
    flex: 1;
  }

  .group-assistant-detail__textarea {
    margin-top: 8px;
  }

  .group-assistant-detail__secret {
    background: #fff8f5;
    border: 1px solid #ffe6d9;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .group-assistant-detail__secret-label {
    font-size: 12px;
    color: #e86835;
    margin-bottom: 8px;
  }

  .group-assistant-detail__secret-value {
    font-size: 12px;
    word-break: break-all;
    color: #2d3436;
    margin-bottom: 8px;
  }

  .group-assistant-detail__field {
    display: block;
    margin-bottom: 16px;
  }

  .group-assistant-detail__label {
    display: block;
    font-size: 13px;
    color: #636e72;
    margin-bottom: 6px;
  }

  .group-assistant-detail__copy-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .group-assistant-detail__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .group-assistant-detail__value {
    font-size: 13px;
    color: #2d3436;
  }

  .group-assistant-detail__security {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }

  .group-assistant-detail__security-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 8px;
  }

  .group-assistant-detail__security-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 13px;
    color: #636e72;
  }

  .group-assistant-detail__security-item--active {
    color: #2d3436;
  }

  .group-assistant-detail__tag {
    font-size: 12px;
    color: #4caf50;
  }

  .group-assistant-detail__tag--muted {
    color: #b2bec3;
  }

  .group-assistant-detail__switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }

  .group-assistant-detail__switch-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cccccc;
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: #ffffff;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  .group-assistant-detail__switch input:checked + .group-assistant-detail__switch-slider {
    background-color: #ff7d45;
  }

  .group-assistant-detail__switch input:checked + .group-assistant-detail__switch-slider:before {
    transform: translateX(20px);
  }

  .group-assistant-detail__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>
