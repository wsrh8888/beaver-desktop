<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  
  <div
    class="card-message"
    :class="[
      `card-message--${typeKey}`,
      { expired: isExpired },
    ]"
    @click.stop="openPreview"
  >
    <div class="card-message-accent" />
    <div class="card-message-body">
      <div class="card-message-avatar-wrap">
        <BeaverImage
          :file-name="displayAvatar"
          :cache-type="CacheType.USER_AVATAR"
          :alt="displayTitle"
          image-class="card-message-avatar"
        />
      </div>
      <div class="card-message-info">
        <div class="card-message-badge">
          {{ typeLabel }}
        </div>
        <div class="card-message-name">
          {{ displayTitle }}
        </div>
        <div class="card-message-desc">
          {{ displayDesc }}
        </div>
      </div>
    </div>
    <div class="card-message-footer">
      <span>点击查看详情</span>
      <span class="card-message-arrow">›</span>
    </div>
  </div>

  <PreviewDialog
    v-if="previewVisible"
    v-model="previewVisible"
    :card-type="card?.cardType || 0"
    :id="card?.id || ''"
    :expire-at="card?.expireAt || 0"
    :invite-token="card?.inviteToken || ''"
  />
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { CardType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { getCircleDetailApi } from 'renderModule/api/circle'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import Logger from 'renderModule/utils/logger'
import PreviewDialog from './components/previewDialog.vue'

function typeLabelOf(cardType?: number) {
  if (cardType === CardType.USER)
    return '个人名片'
  if (cardType === CardType.GROUP)
    return '群名片'
  if (cardType === CardType.CIRCLE)
    return '圈子名片'
  return '名片'
}

function typeKeyOf(cardType?: number) {
  if (cardType === CardType.USER)
    return 'user'
  if (cardType === CardType.GROUP)
    return 'group'
  if (cardType === CardType.CIRCLE)
    return 'circle'
  return 'default'
}

const logger = new Logger('CardMessage')

export default defineComponent({
  name: 'CardMessage',
  components: { BeaverImage, PreviewDialog },
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
    const typeKey = computed(() => typeKeyOf(card.value?.cardType))
    const isExpired = computed(() => {
      const expireAt = card.value?.expireAt ?? 0
      if (expireAt <= 0)
        return false
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
          displayDesc.value = '邀请你加入群聊'
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
          else if (res.code !== 0) {
            logger.warn({ text: '获取圈子名片详情失败', data: { circleId: c.id, code: res.code, msg: res.msg } })
          }
        }
        catch (error) {
          logger.error({ text: '获取圈子名片详情异常', data: { circleId: c.id, error: (error as Error)?.message } })
        }
      }

      if (c.cardType === CardType.USER) {
        displayDesc.value = '推荐给你一位好友'
      }
    }

    onMounted(loadBubble)
    watch(() => [card.value?.id, card.value?.cardType], loadBubble)

    const openPreview = () => {
      if (isExpired.value) {
        Message.error('名片已过期')
        return
      }
      if (!card.value?.id && !card.value?.inviteToken) {
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
      typeKey,
      isExpired,
      previewVisible,
      openPreview,
    }
  },
})
</script>

<style lang="less" scoped>
.card-message {
  position: relative;
  width: 248px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 10px rgba(45, 52, 54, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &.expired {
    opacity: 0.55;
    filter: grayscale(0.35);
  }
}


.card-message-body {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 14px 12px;
}

.card-message-avatar-wrap {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFF1EB;
  box-shadow: inset 0 0 0 1px rgba(255, 125, 69, 0.12);
}

:deep(.card-message-avatar) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-message-info {
  min-width: 0;
  flex: 1;
}

.card-message-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  margin-bottom: 5px;
  border-radius: 4px;
  background: rgba(255, 125, 69, 0.1);
  color: #E86835;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.card-message--user .card-message-badge {
  background: rgba(91, 141, 239, 0.12);
  color: #4A7AD9;
}

.card-message-name {
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-message-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #95A5A6;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-top: 1px solid #F2F3F5;
  background: #FAFBFC;
  font-size: 11px;
  color: #B2BEC3;
}

.card-message-arrow {
  font-size: 14px;
  line-height: 1;
  color: #C8CDD2;
}
</style>
