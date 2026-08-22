<template>
  <div class="share">
    <ShareUi
      v-if="!selectVisible"
      v-model="visible"
      :card-type="cardType"
      :name="name"
      :avatar="avatar"
      :share-link="inviteUrl"
      :qr-image-url="qrImageUrl"
      @cancel="handleClose"
      @share="handleShareCard"
      @copy="handleCopy"
      @save-qr="handleSaveQr"
      @share-link="handleShareLink"
    />

    <SelectConversation
      v-if="selectVisible"
      v-model="selectVisible"
      title="选择会话"
      :msg="pendingMsg"
      @close="handleSelectClose"
      @sent="handleSent"
    />
  </div>
</template>

<script lang="ts">
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { CardType, MessageType } from 'commonModule/type/ajax/chat'
import { computed, defineComponent, type PropType, ref } from 'vue'
import SelectConversation from 'renderModule/components/business/selectConversation/index.vue'
import ShareUi from 'renderModule/components/ui/share/index.vue'
import Message from 'renderModule/components/ui/message'

function parseInviteCode(url: string): string {
  const value = url.trim()
  if (!value)
    return ''
  try {
    const uri = new URL(value)
    const code = uri.searchParams.get('code')
    if (code && (/\/circle\/invite_code/i.test(uri.pathname) || /\/invite_code/i.test(uri.pathname)))
      return code
  }
  catch {
    // ignore
  }
  const match = value.match(/[?&]code=([^&#]+)/i)
  return match?.[1] ? decodeURIComponent(match[1]) : ''
}

export default defineComponent({
  name: 'Share',
  components: { ShareUi, SelectConversation },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    cardType: {
      type: Number as PropType<number>,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    inviteUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectVisible = ref(false)
    const pendingMsg = ref<IMessageMsg | null>(null)

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const inviteCode = computed(() => parseInviteCode(props.inviteUrl))

    const qrImageUrl = computed(() => {
      if (!props.inviteUrl)
        return ''
      const data = encodeURIComponent(props.inviteUrl)
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`
    })

    const cardMsg = computed<IMessageMsg>(() => ({
      type: MessageType.CARD,
      cardMsg: {
        cardType: props.cardType,
        id: props.id,
        inviteToken: inviteCode.value,
      },
    }))

    const linkMsg = computed<IMessageMsg>(() => ({
      type: MessageType.TEXT,
      textMsg: {
        content: props.inviteUrl,
      },
    }))

    const ensureInvite = () => {
      if (!props.inviteUrl) {
        Message.error('暂无可用邀请链接')
        return false
      }
      return true
    }

    const handleClose = () => {
      selectVisible.value = false
      pendingMsg.value = null
      emit('update:modelValue', false)
    }

    const openSelect = (msg: IMessageMsg) => {
      pendingMsg.value = msg
      selectVisible.value = true
    }

    const handleShareCard = () => {
      if (!ensureInvite())
        return
      openSelect(cardMsg.value)
    }

    const handleShareLink = () => {
      if (!ensureInvite())
        return
      openSelect(linkMsg.value)
    }

    const handleCopy = async () => {
      if (!ensureInvite())
        return
      try {
        await navigator.clipboard.writeText(props.inviteUrl)
        Message.success('邀请链接已复制')
        handleClose()
      }
      catch {
        Message.error('复制失败')
      }
    }

    const handleSaveQr = async () => {
      if (!ensureInvite() || !qrImageUrl.value)
        return
      try {
        const res = await fetch(qrImageUrl.value)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const prefix = props.cardType === CardType.GROUP ? 'group' : 'circle'
        a.href = url
        a.download = `${prefix}-qr-${inviteCode.value || props.id}.png`
        a.click()
        URL.revokeObjectURL(url)
        Message.success('二维码已保存')
      }
      catch {
        Message.error('保存失败')
      }
    }

    const handleSelectClose = () => {
      selectVisible.value = false
      pendingMsg.value = null
    }

    const handleSent = () => {
      selectVisible.value = false
      pendingMsg.value = null
      emit('update:modelValue', false)
    }

    return {
      visible,
      inviteUrl: computed(() => props.inviteUrl),
      qrImageUrl,
      selectVisible,
      pendingMsg,
      handleClose,
      handleShareCard,
      handleShareLink,
      handleCopy,
      handleSaveQr,
      handleSelectClose,
      handleSent,
    }
  },
})
</script>

<style lang="less" scoped>
.share {
  pointer-events: auto;
}
</style>
