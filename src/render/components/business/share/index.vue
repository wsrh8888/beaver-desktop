<template>
  <div class="share">
    <ShareUi
      v-model="visible"
      :card-type="cardType"
      :name="name"
      :avatar="avatar"
      :share-link="shareLink"
      :qr-image-url="qrImageUrl"
      @cancel="handleClose"
      @share="handleShareCard"
      @copy="handleCopy"
      @save-qr="handleSaveQr"
      @share-link="handleShareLink"
    />

    <RecentConversation
      v-model="recentVisible"
      :title="recentTitle"
      :msg="pendingMsg"
      @close="recentVisible = false"
      @sent="handleSent"
    />
  </div>
</template>

<script lang="ts">
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { CardType, MessageType } from 'commonModule/type/ajax/chat'
import { computed, defineComponent, type PropType, ref, watch } from 'vue'
import RecentConversation from 'renderModule/components/business/recentConversation/index.vue'
import ShareUi from 'renderModule/components/ui/share/index.vue'
import Message from 'renderModule/components/ui/message'

function buildShareLink(cardType: number, id: string) {
  if (cardType === CardType.GROUP)
    return `beaver://share/group/${id}`
  if (cardType === CardType.CIRCLE)
    return `beaver://share/circle/${id}`
  return id
}

function buildInviteQrValue(cardType: number, id: string) {
  const action = cardType === CardType.GROUP ? 'joinGroup' : 'joinCircle'
  const payloadKey = cardType === CardType.GROUP ? 'groupId' : 'circleId'
  return JSON.stringify({
    action,
    appName: 'beaver',
    version: '1.0.0',
    timestamp: Date.now(),
    expireAt: 0,
    payload: { [payloadKey]: id },
  })
}

export default defineComponent({
  name: 'Share',
  components: { ShareUi, RecentConversation },
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const recentVisible = ref(false)
    const pendingMsg = ref<IMessageMsg | null>(null)

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const shareLink = computed(() => buildShareLink(props.cardType, props.id))

    const qrImageUrl = computed(() => {
      const data = encodeURIComponent(buildInviteQrValue(props.cardType, props.id))
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`
    })

    const recentTitle = computed(() => {
      if (props.cardType === CardType.GROUP)
        return '发送到会话'
      if (props.cardType === CardType.CIRCLE)
        return '发送到会话'
      return '选择会话'
    })

    const cardMsg = computed<IMessageMsg>(() => ({
      type: MessageType.CARD,
      cardMsg: {
        cardType: props.cardType,
        id: props.id,
        expireAt: 0,
      },
    }))

    const linkMsg = computed<IMessageMsg>(() => ({
      type: MessageType.TEXT,
      textMsg: {
        content: shareLink.value,
      },
    }))

    watch(() => props.modelValue, (val) => {
      if (val)
        recentVisible.value = false
    })

    const handleClose = () => {
      emit('update:modelValue', false)
    }

    const openRecent = (msg: IMessageMsg) => {
      pendingMsg.value = msg
      recentVisible.value = true
    }

    const handleShareCard = () => {
      openRecent(cardMsg.value)
      handleClose()
    }

    const handleShareLink = () => {
      openRecent(linkMsg.value)
      handleClose()
    }

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value)
        Message.success('邀请链接已复制')
        handleClose()
      }
      catch {
        Message.error('复制失败')
      }
    }

    const handleSaveQr = async () => {
      try {
        const res = await fetch(qrImageUrl.value)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const prefix = props.cardType === CardType.GROUP ? 'group' : 'circle'
        a.href = url
        a.download = `${prefix}-qr-${props.id || 'invite'}.png`
        a.click()
        URL.revokeObjectURL(url)
        Message.success('二维码已保存')
      }
      catch {
        Message.error('保存失败')
      }
    }

    const handleSent = () => {
      recentVisible.value = false
    }

    return {
      visible,
      shareLink,
      qrImageUrl,
      recentVisible,
      recentTitle,
      pendingMsg,
      handleClose,
      handleShareCard,
      handleShareLink,
      handleCopy,
      handleSaveQr,
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
