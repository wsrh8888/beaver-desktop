<template>
  <div class="bot-custom-manage">
    <div class="bot-custom-manage__header">
      <div class="bot-custom-manage__avatar-row" @click="pickAvatar">
        <img v-if="formAvatar" :src="formAvatar" class="bot-custom-manage__avatar-image" alt="">
        <img v-else :src="defaultAvatar" class="bot-custom-manage__avatar-image" alt="">
        <span class="bot-custom-manage__edit-badge">
          <img src="renderModule/assets/image/groupAssistant/edit.svg" alt="">
        </span>
      </div>
      <input ref="avatarInputRef" type="file" accept="image/*" class="bot-custom-manage__avatar-input" @change="onAvatarChange">
    </div>

    <label class="bot-custom-manage__field">
      <span class="bot-custom-manage__label">* 名称</span>
      <input v-model="formName" class="bot-custom-manage__input" type="text" placeholder="如 Jenkins 构建通知">
    </label>

    <label class="bot-custom-manage__field">
      <span class="bot-custom-manage__label">* 简介</span>
      <textarea v-model="formDescription" class="bot-custom-manage__textarea" rows="4" maxlength="200" />
      <span class="bot-custom-manage__counter">{{ formDescription.length }} / 200</span>
    </label>

    <label v-if="webhookUrl" class="bot-custom-manage__field">
      <span class="bot-custom-manage__label">Webhook</span>
      <div class="bot-custom-manage__webhook-row">
        <input class="bot-custom-manage__input bot-custom-manage__input--readonly" type="text" readonly :value="webhookUrl">
        <BeaverButton size="small" @click="copyText(webhookUrl)">
          复制
        </BeaverButton>
        <BeaverButton size="small" type="default" @click="handleResetSecret">
          重置
        </BeaverButton>
      </div>
      <p class="bot-custom-manage__warning">请保管好此 webhook 地址。不要公布在 Github、博客等可公开查阅的地方。</p>
    </label>

    <!-- 安全设置 -->
    <div class="bot-custom-manage__security">
      <div class="bot-custom-manage__security-group">
        <span class="bot-custom-manage__security-label">安全设置</span>
        <div class="bot-custom-manage__security-options">
          <label class="bot-custom-manage__checkbox-item">
            <input v-model="keywordsEnabled" type="checkbox">
            <span class="bot-custom-manage__checkbox-text">自定义关键词</span>
            <img src="renderModule/assets/image/common/help.svg" class="bot-custom-manage__help-icon" alt="帮助" @click.stop="showKeywordsHelp">
          </label>
          <label class="bot-custom-manage__checkbox-item">
            <input v-model="ipWhitelistEnabled" type="checkbox">
            <span class="bot-custom-manage__checkbox-text">IP白名单</span>
            <img src="renderModule/assets/image/common/help.svg" class="bot-custom-manage__help-icon" alt="帮助" @click.stop="showIpHelp">
          </label>
          <label class="bot-custom-manage__checkbox-item">
            <input v-model="signEnabled" type="checkbox">
            <span class="bot-custom-manage__checkbox-text">签名校验</span>
            <img src="renderModule/assets/image/common/help.svg" class="bot-custom-manage__help-icon" alt="帮助" @click.stop="showSignHelp">
          </label>
        </div>

        <label v-if="keywordsEnabled" class="bot-custom-manage__field bot-custom-manage__field--nested">
          <span class="bot-custom-manage__label">关键词（最多10个，每行一个）</span>
          <textarea v-model="formKeywords" class="bot-custom-manage__textarea" rows="3" placeholder="例如：deploy&#10;build success" />
        </label>

        <label v-if="ipWhitelistEnabled" class="bot-custom-manage__field bot-custom-manage__field--nested">
          <span class="bot-custom-manage__label">IP 白名单（每行一个）</span>
          <textarea v-model="formIpWhitelist" class="bot-custom-manage__textarea" rows="3" placeholder="例如：192.168.1.10&#10;10.0.0.0/24" />
        </label>

        <!-- 签名校验密钥 -->
        <div v-if="signEnabled" class="bot-custom-manage__sign-section">
          <div class="bot-custom-manage__sign-input-wrapper">
            <input type="text" :value="signSecret" class="bot-custom-manage__sign-input" readonly>
            <button class="bot-custom-manage__copy-btn" @click="copySignSecret">复制</button>
          </div>
          <button class="bot-custom-manage__reset-btn" @click="resetSignSecret">重置</button>
        </div>
        <p v-if="signEnabled" class="bot-custom-manage__sign-hint">密钥如上，签名方法详见 <a class="bot-custom-manage__link" @click="showHelpDoc">帮助文档</a></p>
      </div>
    </div>

    <div class="bot-custom-manage__footer">
      <div class="bot-custom-manage__footer-left">
        <a href="javascript:void(0)" class="bot-custom-manage__link">
          <img src="renderModule/assets/image/groupAssistant/help.svg" alt="">
          配置说明
        </a>
        <span class="bot-custom-manage__divider">|</span>
        <span class="bot-custom-manage__delete-btn" @click="handleDelete">
          <img src="renderModule/assets/image/groupAssistant/delete.svg" alt="">
          删除群助手
        </span>
      </div>
      <BeaverButton type="primary" :loading="submitting" @click="submitSave">
        保存
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import {
  deleteBotApi,
  getBotDetailApi,
  resetBotSecretApi,
  updateBotApi,
} from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import Message from 'renderModule/components/ui/message'
import MessageBox from 'renderModule/components/ui/messagebox'
import { uploadFile } from 'renderModule/utils/upload'
import { copyToClipboard } from '../../../../right-component/content/utils/copy'
import { botTemplateOptions } from '../../config'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, onMounted, ref } from 'vue'

const customTemplate = botTemplateOptions.find(item => item.key === 'custom')!

export default defineComponent({
  name: 'botCustomManage',
  components: { BeaverButton },
  emits: ['close'],
  setup(_, { emit }) {
    const groupAssistantViewStore = useGroupAssistantViewStore()
    const userStore = useUserStore()
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const submitting = ref(false)
    const formName = ref('')
    const formDescription = ref('')
    const formAvatar = ref('') // 存储完整的 fileUrl
    const webhookUrl = ref('')
    const keywordsEnabled = ref(false) // 自定义关键词开关
    const ipWhitelistEnabled = ref(false) // IP 白名单开关
    const signEnabled = ref(false) // 签名校验开关
    const signSecret = ref('') // 签名密钥
    const formKeywords = ref('')
    const formIpWhitelist = ref('')

    const parseLines = (value: string) => {
      return value
        .split(/[\n,，]/)
        .map(item => item.trim())
        .filter(Boolean)
    }

    const defaultAvatar = customTemplate.avatar
    const groupBotId = computed(() => String(groupAssistantViewStore.groupBotId))

    const fillForm = (bot: {
      name: string
      description: string
      avatar: string // 后端返回的已经是完整URL
      webhookUrl: string
      security?: {
        keywordsEnabled: boolean
        keywords?: string[]
        ipWhitelistEnabled: boolean
        ipWhitelist?: string[]
        signatureEnabled: boolean
        signatureSecret: string
      }
    }) => {
      formName.value = bot.name
      formDescription.value = bot.description
      formAvatar.value = bot.avatar // 直接使用，不需要转换
      webhookUrl.value = bot.webhookUrl
      keywordsEnabled.value = bot.security?.keywordsEnabled || false
      ipWhitelistEnabled.value = bot.security?.ipWhitelistEnabled || false
      signEnabled.value = bot.security?.signatureEnabled || false
      signSecret.value = bot.security?.signatureSecret || ''
      formKeywords.value = (bot.security?.keywords || []).join('\n')
      formIpWhitelist.value = (bot.security?.ipWhitelist || []).join('\n')
    }

    const loadBot = async () => {
      const res = await getBotDetailApi({ botId: groupBotId.value })
      if (res.code !== 0)
        return
      fillForm(res.result)
    }

    onMounted(() => {
      loadBot()
    })

    const pickAvatar = () => avatarInputRef.value?.click()

    const onAvatarChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file)
        return
      const result = await uploadFile(file)
      if (result?.fileUrl)
        formAvatar.value = result.fileUrl
    }

    const submitSave = async () => {
      if (!formName.value.trim()) {
        Message.error('请填写名称')
        return
      }

      const keywords = parseLines(formKeywords.value)
      const ipWhitelist = parseLines(formIpWhitelist.value)

      if (keywordsEnabled.value && keywords.length === 0) {
        Message.error('请填写至少一个关键词')
        return
      }
      if (keywords.length > 10) {
        Message.error('关键词最多10个')
        return
      }
      if (ipWhitelistEnabled.value && ipWhitelist.length === 0) {
        Message.error('请填写至少一个 IP 地址')
        return
      }

      submitting.value = true
      const res = await updateBotApi({
        botId: groupBotId.value,
        name: formName.value.trim(),
        description: formDescription.value.trim(),
        avatar: formAvatar.value, // 直接传递 fileUrl
        status: undefined, // 暂时不更新状态
        security: {
          keywordsEnabled: keywordsEnabled.value,
          keywords,
          ipWhitelistEnabled: ipWhitelistEnabled.value,
          ipWhitelist,
          signatureEnabled: signEnabled.value,
          signatureSecret: signSecret.value,
          signatureUpdated: Date.now(),
        },
      })
      submitting.value = false
      if (res.code === 0)
        Message.success('已保存')
    }

    const handleResetSecret = async () => {
      await MessageBox.confirm('重置后旧密钥立即失效，请确认？', '重置密钥')
      const res = await resetBotSecretApi({ botId: groupBotId.value })
      if (res.code === 0) {
        Message.success('密钥已重置')
        await loadBot()
      }
    }

    const handleDelete = async () => {
      await MessageBox.confirm('删除后 Webhook 将不可用，请确认？', '删除群助手')
      const res = await deleteBotApi({ botId: groupBotId.value })
      if (res.code === 0) {
        Message.success('已删除')
        emit('close')
      }
    }

    const copyText = async (text: string) => {
      if (await copyToClipboard(text))
        Message.success('已复制')
    }

    const copySignSecret = async () => {
      await copyText(signSecret.value)
    }

    const resetSignSecret = async () => {
      await handleResetSecret()
    }

    const showKeywordsHelp = () => {
      Message.info('自定义关键词帮助文档')
    }

    const showIpHelp = () => {
      Message.info('IP白名单帮助文档')
    }

    const showSignHelp = () => {
      Message.info('签名校验帮助文档')
    }

    const showHelpDoc = () => {
      Message.info('打开帮助文档')
    }

    return {
      avatarInputRef,
      submitting,
      formName,
      formDescription,
      formAvatar,
      defaultAvatar,
      webhookUrl,
      keywordsEnabled,
      ipWhitelistEnabled,
      signEnabled,
      signSecret,
      formKeywords,
      formIpWhitelist,
      pickAvatar,
      onAvatarChange,
      submitSave,
      handleResetSecret,
      handleDelete,
      copyText,
      copySignSecret,
      resetSignSecret,
      showKeywordsHelp,
      showIpHelp,
      showSignHelp,
      showHelpDoc,
    }
  },
})
</script>

<style lang="less" scoped>
.bot-custom-manage {
  padding: 20px;

  .bot-custom-manage__header {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    position: relative;
  }

  .bot-custom-manage__avatar-row {
    position: relative;
    cursor: pointer;

    &:hover .bot-custom-manage__edit-badge {
      opacity: 1;
    }
  }

  .bot-custom-manage__avatar-input {
    display: none;
  }

  .bot-custom-manage__avatar-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }

  .bot-custom-manage__edit-badge {
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

  .bot-custom-manage__field {
    display: block;
    margin-bottom: 20px;
  }

  .bot-custom-manage__label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  .bot-custom-manage__input,
  .bot-custom-manage__textarea {
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

  .bot-custom-manage__textarea {
    resize: none;
  }

  .bot-custom-manage__counter {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .bot-custom-manage__input--readonly {
    background: #f5f5f5;
    flex: 1;
  }

  .bot-custom-manage__webhook-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .bot-custom-manage__warning {
    font-size: 12px;
    color: #ff4d4f;
    margin-top: 8px;
    line-height: 1.6;
  }

  .bot-custom-manage__field--nested {
    margin-top: 4px;
    margin-bottom: 12px;
  }

  .bot-custom-manage__security {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }

  .bot-custom-manage__security-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bot-custom-manage__security-label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .bot-custom-manage__security-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bot-custom-manage__checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  .bot-custom-manage__checkbox-text {
    font-size: 14px;
    color: #333;
    flex: 1;
  }

  .bot-custom-manage__help-icon {
    width: 14px;
    height: 14px;
    cursor: pointer;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }

  .bot-custom-manage__sign-section {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
  }

  .bot-custom-manage__sign-input-wrapper {
    flex: 1;
    display: flex;
    gap: 8px;
  }

  .bot-custom-manage__sign-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    font-size: 13px;
    background: #f5f5f5;
    color: #666;
    outline: none;
  }

  .bot-custom-manage__copy-btn {
    padding: 8px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fff;
    color: #2d8cf0;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #2d8cf0;
    }
  }

  .bot-custom-manage__reset-btn {
    padding: 8px 16px;
    border: 1px solid #2d8cf0;
    border-radius: 4px;
    background: #fff;
    color: #2d8cf0;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #2d8cf0;
      color: #fff;
    }
  }

  .bot-custom-manage__sign-hint {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }

  .bot-custom-manage__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .bot-custom-manage__footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bot-custom-manage__link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #2d8cf0;
    text-decoration: none;

    img {
      width: 14px;
      height: 14px;
    }
  }

  .bot-custom-manage__divider {
    color: #e8e8e8;
  }

  .bot-custom-manage__delete-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #ff4d4f;
    cursor: pointer;

    img {
      width: 14px;
      height: 14px;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
