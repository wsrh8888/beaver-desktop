<template>
  <BeaverDialog v-model="visible" :title="dialogTitle" width="400px" @close="handleClose">
    <div class="entity-share">
      <div class="entity-share-title">分享「{{ name }}」</div>
      <div class="entity-share-actions">
        <button class="entity-share-action" type="button" @click="handleCard">
          <span class="entity-share-icon">名片</span>
          <span>发到聊天</span>
        </button>
        <button class="entity-share-action" type="button" @click="handleCopyLink">
          <span class="entity-share-icon">链接</span>
          <span>复制链接</span>
        </button>
        <button class="entity-share-action" type="button" @click="showQr = !showQr">
          <span class="entity-share-icon">二维码</span>
          <span>{{ showQr ? '收起' : '显示' }}</span>
        </button>
      </div>
      <div v-if="showQr" class="entity-share-qr">
        <img :src="qrImageUrl" alt="邀请二维码" class="entity-share-qr-img">
        <p>扫码即可加入</p>
      </div>
    </div>
  </BeaverDialog>

  <ShareToConversationDialog
    v-model="shareDialogVisible"
    :title="shareDialogTitle"
    :msg="cardMsg"
  />
</template>

<script lang="ts">
import { CardType, MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import Message from 'renderModule/components/ui/message'
import ShareToConversationDialog from 'renderModule/windows/app/page/message/right-component/content/components/shareToConversationDialog.vue'
import { computed, defineComponent, PropType, ref, watch } from 'vue'

function buildShareLink(cardType: number, id: string) {
  if (cardType === CardType.GROUP) return `beaver://share/group/${id}`
  if (cardType === CardType.CIRCLE) return `beaver://share/circle/${id}`
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
  name: 'EntityShareDialog',
  components: { BeaverDialog, ShareToConversationDialog },
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const showQr = ref(false)
    const shareDialogVisible = ref(false)

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const dialogTitle = computed(() => {
      if (props.cardType === CardType.GROUP) return '分享群聊'
      if (props.cardType === CardType.CIRCLE) return '分享圈子'
      return '分享'
    })

    const shareDialogTitle = computed(() => {
      if (props.cardType === CardType.GROUP) return '发送群名片'
      if (props.cardType === CardType.CIRCLE) return '发送圈子名片'
      return '发送名片'
    })

    const shareLink = computed(() => buildShareLink(props.cardType, props.id))

    const qrImageUrl = computed(() => {
      const data = encodeURIComponent(buildInviteQrValue(props.cardType, props.id))
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`
    })

    const cardMsg = computed<IMessageMsg>(() => ({
      type: MessageType.CARD,
      cardMsg: {
        cardType: props.cardType,
        id: props.id,
        expireAt: 0,
      },
    }))

    watch(() => props.modelValue, (val) => {
      if (!val)
        showQr.value = false
    })

    const handleClose = () => {
      emit('update:modelValue', false)
    }

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value)
        Message.success('邀请链接已复制')
        handleClose()
      }
      catch {
        Message.error('复制失败')
      }
    }

    const handleCard = () => {
      handleClose()
      shareDialogVisible.value = true
    }

    return {
      visible,
      showQr,
      shareDialogVisible,
      dialogTitle,
      shareDialogTitle,
      qrImageUrl,
      cardMsg,
      handleClose,
      handleCopyLink,
      handleCard,
    }
  },
})
</script>

<style lang="less" scoped>
.entity-share-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 16px;
}

.entity-share-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.entity-share-action {
  border: 1px solid #EBEEF5;
  background: #F9FAFB;
  border-radius: 8px;
  padding: 14px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #2D3436;
  font-size: 12px;

  &:hover {
    background: #FFF1EB;
    border-color: #FFD0BC;
  }
}

.entity-share-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #FF7D45;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.entity-share-qr {
  margin-top: 16px;
  text-align: center;

  p {
    margin: 8px 0 0;
    font-size: 12px;
    color: #636E72;
  }
}

.entity-share-qr-img {
  width: 180px;
  height: 180px;
  background: #fff;
}
</style>
