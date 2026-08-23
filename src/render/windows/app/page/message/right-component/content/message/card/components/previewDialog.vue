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
  <BeaverDialog v-model="visible" :title="typeLabel" width="360px" @close="handleClose">
    <div class="card-preview">
      <div class="card-preview-shell">
        <div class="card-preview-accent" />
        <div class="card-preview-main">
          <BeaverImage
            :file-name="avatar"
            :cache-type="CacheType.USER_AVATAR"
            :alt="name"
            image-class="card-preview-avatar"
          />
          <div class="card-preview-name">
            {{ name }}
          </div>
          <div v-if="desc" class="card-preview-desc">
            {{ desc }}
          </div>
          <div v-if="expired" class="card-preview-expired">
            名片已过期
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <BeaverButton type="default" @click="handleClose">
        关闭
      </BeaverButton>
      <BeaverButton
        v-if="!expired"
        type="primary"
        :disabled="joining"
        style="margin-left:8px"
        @click="handlePrimary"
      >
        {{ primaryButtonText }}
      </BeaverButton>
    </template>
  </BeaverDialog>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { CardType } from 'commonModule/type/ajax/chat'
import { getCircleDetailApi, joinCircleApi, resolveCircleInviteApi } from 'renderModule/api/circle'
import { getGroupInfoApi, joinGroupApi, resolveGroupInviteApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { useContactStore } from 'renderModule/windows/app/pinia/contact/contact'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useFriendViewStore } from 'renderModule/windows/app/pinia/view/friend'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { useCircleStore } from 'renderModule/windows/app/pinia/circle/circle'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'PreviewDialog',
  components: { BeaverDialog, BeaverButton, BeaverImage },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    cardType: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Number,
      default: 0,
    },
    inviteToken: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter()
    const contactStore = useContactStore()
    const conversationStore = useConversationStore()
    const friendStore = useFriendStore()
    const friendViewStore = useFriendViewStore()
    const groupStore = useGroupStore()
    const messageViewStore = useMessageViewStore()
    const circleStore = useCircleStore()

    const joining = ref(false)
    const name = ref('')
    const avatar = ref('')
    const desc = ref('')
    const alreadyJoined = ref(false)
    const isFriend = ref(false)
    const conversationId = ref('')
    const resolvedId = ref(props.id || '')

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const typeLabel = computed(() => {
      if (props.cardType === CardType.USER)
        return '个人名片'
      if (props.cardType === CardType.GROUP)
        return '群名片'
      if (props.cardType === CardType.CIRCLE)
        return '圈子名片'
      return '名片'
    })

    const expired = computed(() => {
      if (!props.expireAt || props.expireAt <= 0)
        return false
      return Math.floor(Date.now() / 1000) >= props.expireAt
    })

    const primaryButtonText = computed(() => {
      if (props.cardType === CardType.USER)
        return isFriend.value ? '发消息' : '查看资料'
      if (alreadyJoined.value) {
        if (props.cardType === CardType.GROUP)
          return '进入群聊'
        if (props.cardType === CardType.CIRCLE)
          return '进入圈子'
        return '已加入'
      }
      return '加入'
    })

    const normalizeGroupId = (id: string) => (
      id.startsWith('group_') ? id.slice('group_'.length) : id
    )

    const loadByInviteToken = async () => {
      if (props.cardType === CardType.GROUP) {
        const res = await resolveGroupInviteApi({ code: props.inviteToken })
        if (res.code !== 0 || !res.result || (!res.result.valid && !res.result.alreadyJoined))
          return
        const data = res.result
        resolvedId.value = data.groupId
        conversationId.value = `group_${data.groupId}`
        name.value = data.title || '群聊'
        avatar.value = data.avatar || ''
        desc.value = data.notice || `${data.memberCount || 0} 位成员`
        alreadyJoined.value = !!data.alreadyJoined
        return
      }
      if (props.cardType === CardType.CIRCLE) {
        const res = await resolveCircleInviteApi({ code: props.inviteToken })
        if (res.code !== 0 || !res.result || (!res.result.valid && !res.result.alreadyJoined))
          return
        const data = res.result
        resolvedId.value = data.circleId
        conversationId.value = `circle_${data.circleId}`
        name.value = data.name || '圈子'
        avatar.value = data.avatar || ''
        desc.value = data.description || `${data.memberCount || 0} 位成员`
        alreadyJoined.value = !!data.alreadyJoined
      }
    }

    const load = async () => {
      name.value = typeLabel.value
      try {
        if (props.inviteToken && !props.id && (props.cardType === CardType.GROUP || props.cardType === CardType.CIRCLE)) {
          await loadByInviteToken()
          return
        }
        if (!props.id)
          return
        if (props.cardType === CardType.USER) {
          const user = contactStore.getContact(props.id)
          name.value = user.nickName || '用户'
          avatar.value = user.avatar || ''
          desc.value = user.abstract || '个人名片'
          isFriend.value = !!friendStore.getFriendByUserId(props.id)
        }
        else if (props.cardType === CardType.GROUP) {
          const groupId = normalizeGroupId(props.id)
          resolvedId.value = groupId
          conversationId.value = `group_${groupId}`
          const cached = groupStore.getGroupById(conversationId.value)
          if (cached) {
            name.value = cached.title || '群聊'
            avatar.value = cached.avatar || ''
            desc.value = '群名片'
            alreadyJoined.value = true
          }
          const res = await getGroupInfoApi({ groupId })
          if (res.code === 0 && res.result) {
            name.value = res.result.title || name.value || '群聊'
            avatar.value = res.result.avatar || avatar.value
            desc.value = res.result.notice
              || (res.result.memberCount ? `${res.result.memberCount} 位成员` : '群名片')
            alreadyJoined.value = !!groupStore.getGroupById(conversationId.value)
          }
        }
        else if (props.cardType === CardType.CIRCLE) {
          resolvedId.value = props.id
          conversationId.value = props.id.startsWith('circle_') ? props.id : `circle_${props.id}`
          const cached = circleStore.getCircleById(conversationId.value)
          if (cached) {
            name.value = cached.name || '圈子'
            avatar.value = cached.avatar || ''
            alreadyJoined.value = true
          }
          const res = await getCircleDetailApi({ circleId: props.id })
          if (res.code === 0 && res.result) {
            name.value = res.result.name || name.value || '圈子'
            avatar.value = res.result.avatar || avatar.value
            desc.value = res.result.description
              || `${res.result.memberCount || 0} 位成员`
            alreadyJoined.value = (res.result.role || 0) > 0 || !!circleStore.getCircleById(conversationId.value)
          }
        }
      }
      catch {
        // ignore
      }
    }

    onMounted(() => {
      load()
    })

    const handleClose = () => {
      emit('update:modelValue', false)
    }

    const openFriendPage = () => {
      if (isFriend.value) {
        const friend = friendStore.getFriendByUserId(props.id)
        if (friend?.conversationId) {
          messageViewStore.setCurrentChat(friend.conversationId)
          router.push('/message')
          handleClose()
          return
        }
      }
      friendViewStore.setCurrentTab('friends')
      friendViewStore.setSelectedConversationWithType(props.id, 'friend')
      router.push('/friend')
      handleClose()
    }

    const openGroupChat = async () => {
      if (!conversationId.value) return
      await messageViewStore.setCurrentChat(conversationId.value)
      router.push('/message')
      handleClose()
    }

    const openCircle = async () => {
      const id = resolvedId.value || props.id
      if (!id)
        return
      const cid = id.startsWith('circle_') ? id : `circle_${id}`
      await circleStore.init()
      await messageViewStore.setCurrentChat(cid)
      router.push('/message')
      handleClose()
    }

    const handlePrimary = async () => {
      if (expired.value || joining.value) return

      if (props.cardType === CardType.USER) {
        openFriendPage()
        return
      }

      if (alreadyJoined.value) {
        if (props.cardType === CardType.GROUP) openGroupChat()
        else if (props.cardType === CardType.CIRCLE) openCircle()
        return
      }

      joining.value = true
      try {
        if (props.cardType === CardType.GROUP) {
          const groupId = normalizeGroupId(resolvedId.value || props.id)
          const res = await joinGroupApi({
            groupId: groupId || undefined,
            inviteCode: props.inviteToken || undefined,
          })
          if (res.code === 0) {
            const status = res.result?.status ?? 1
            if (status === 0) {
              Message.success('申请已提交，等待群主审批')
              handleClose()
            }
            else {
              Message.success('已加入群聊')
              alreadyJoined.value = true
              const gid = res.result?.groupId || groupId
              if (gid) {
                resolvedId.value = gid
                conversationId.value = `group_${gid}`
              }
              await groupStore.init()
              openGroupChat()
            }
          }
          else {
            Message.error(res.msg || '加入失败')
          }
        }
        else if (props.cardType === CardType.CIRCLE) {
          const circleId = resolvedId.value || props.id
          const res = await joinCircleApi({
            circleId: circleId || undefined,
            inviteCode: props.inviteToken || undefined,
          })
          if (res.code === 0) {
            const status = res.result?.status ?? 1
            if (status === 0) {
              Message.success('申请已提交，等待圈主审批')
              handleClose()
            }
            else {
              Message.success('已加入圈子')
              alreadyJoined.value = true
              const id = res.result?.circleId || circleId || resolvedId.value
              if (id)
                resolvedId.value = id
              await circleStore.init()
              if (id)
                await conversationStore.initConversationById(`circle_${id}`)
              openCircle()
            }
          }
          else {
            Message.error(res.msg || '加入失败')
          }
        }
      }
      catch {
        Message.error('加入失败')
      }
      finally {
        joining.value = false
      }
    }

    return {
      CacheType,
      visible,
      joining,
      name,
      avatar,
      desc,
      expired,
      typeLabel,
      primaryButtonText,
      handleClose,
      handlePrimary,
    }
  },
})
</script>

<style lang="less" scoped>
.card-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 8px;
  min-height: 180px;
}

.card-preview-shell {
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #FFFFFF;
  box-shadow: 0 4px 16px rgba(45, 52, 54, 0.06);
}

.card-preview-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px 18px;
}

:deep(.card-preview-avatar) {
  width: 76px;
  height: 76px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.18);
}

.card-preview-name {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 600;
  color: #2D3436;
  text-align: center;
}

.card-preview-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #636E72;
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
}

.card-preview-expired {
  margin-top: 10px;
  font-size: 12px;
  color: #F44336;
}
</style>
