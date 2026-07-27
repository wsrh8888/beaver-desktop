<template>
  <div class="card-message" :class="{ expired: isExpired }" @click.stop="openPreview">
    <div class="card-body">
      <BeaverImage
        :file-name="displayAvatar"
        :cache-type="CacheType.USER_AVATAR"
        :alt="displayTitle"
        image-class="card-avatar"
      />
      <div class="card-info">
        <div class="card-name">{{ displayTitle }}</div>
        <div class="card-desc">{{ displayDesc }}</div>
      </div>
    </div>
    <div class="card-footer">{{ typeLabel }}</div>
  </div>

  <CardPreviewDialog
    v-model="previewVisible"
    :card-type="card?.cardType || 0"
    :id="card?.id || ''"
    :expire-at="card?.expireAt || 0"
  />
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { CardType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { getCircleDetailApi } from 'renderModule/api/circle'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import CardPreviewDialog from 'renderModule/windows/app/page/message/right-component/content/components/cardPreviewDialog.vue'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'

function typeLabelOf(cardType?: number) {
  if (cardType === CardType.USER) return '个人名片'
  if (cardType === CardType.GROUP) return '群名片'
  if (cardType === CardType.CIRCLE) return '圈子名片'
  return '名片'
}

export default defineComponent({
  name: 'CardMessage',
  components: { BeaverImage, CardPreviewDialog },
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    const groupStore = useGroupStore()
    const previewVisible = ref(false)
    const displayTitle = ref('名片')
    const displayAvatar = ref('')
    const displayDesc = ref('')

    const card = computed(() => props.msg.cardMsg)
    const typeLabel = computed(() => typeLabelOf(card.value?.cardType))
    const isExpired = computed(() => {
      const expireAt = card.value?.expireAt ?? 0
      if (expireAt <= 0) return false
      return Math.floor(Date.now() / 1000) >= expireAt
    })

    const loadBubble = async () => {
      const c = card.value
      if (!c?.id) {
        displayTitle.value = typeLabel.value
        displayDesc.value = '信息不完整'
        return
      }
      displayTitle.value = typeLabel.value
      displayDesc.value = '点击查看'
      displayAvatar.value = ''

      if (c.cardType === CardType.GROUP) {
        const conversationId = c.id.startsWith('group_') ? c.id : `group_${c.id}`
        const group = groupStore.getGroupById(conversationId)
        if (group) {
          displayTitle.value = group.title || typeLabel.value
          displayAvatar.value = group.avatar || ''
          displayDesc.value = '群名片'
        }
        return
      }

      if (c.cardType === CardType.CIRCLE) {
        try {
          const res = await getCircleDetailApi({ circleId: c.id })
          if (res.code === 0 && res.result) {
            displayTitle.value = res.result.name || typeLabel.value
            displayAvatar.value = res.result.avatar || ''
            displayDesc.value = res.result.description
              || `${res.result.memberCount || 0} 位成员`
          }
        }
        catch {
          // keep fallback
        }
      }
    }

    onMounted(loadBubble)
    watch(() => [card.value?.id, card.value?.cardType], loadBubble)

    const openPreview = () => {
      if (isExpired.value) {
        Message.error('名片已过期')
        return
      }
      if (!card.value?.id) {
        Message.error('名片信息不完整')
        return
      }
      previewVisible.value = true
    }

    return {
      CacheType,
      card,
      displayTitle,
      displayAvatar,
      displayDesc,
      typeLabel,
      isExpired,
      previewVisible,
      openPreview,
    }
  },
})
</script>

<style lang="less" scoped>
.card-message {
  min-width: 220px;
  max-width: 260px;
  cursor: pointer;

  &.expired {
    opacity: 0.55;
  }
}

.card-body {
  display: flex;
  gap: 10px;
  align-items: center;
}

:deep(.card-avatar) {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-info {
  min-width: 0;
  flex: 1;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 11px;
  opacity: 0.65;
}
</style>
