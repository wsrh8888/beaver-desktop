<template>
  <BeaverDialog v-model="visible" :title="typeLabel" width="360px" @close="handleClose">
    <div class="card-preview">
      <div v-if="loading" class="card-preview-loading">
        加载中...
      </div>
      <template v-else-if="loadError">
        <div class="card-preview-error">{{ loadError }}</div>
      </template>
      <template v-else>
        <BeaverImage
          :file-name="avatar"
          :cache-type="CacheType.USER_AVATAR"
          :alt="name"
          image-class="card-preview-avatar"
        />
        <div class="card-preview-name">{{ name }}</div>
        <div v-if="desc" class="card-preview-desc">{{ desc }}</div>
        <div v-if="expired" class="card-preview-expired">名片已过期</div>
      </template>
    </div>
    <template #footer>
      <BeaverButton type="default" @click="handleClose">
        关闭
      </BeaverButton>
      <BeaverButton
        v-if="!loading && !loadError && !expired"
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
import { getCircleDetailApi, joinCircleApi } from 'renderModule/api/circle'
import { getGroupInfoApi, joinGroupApi } from 'renderModule/api/group'
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
import { computed, defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'CardPreviewDialog',
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

    const loading = ref(false)
    const joining = ref(false)
    const loadError = ref('')
    const name = ref('')
    const avatar = ref('')
    const desc = ref('')
    const alreadyJoined = ref(false)
    const isFriend = ref(false)
    const conversationId = ref('')

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const typeLabel = computed(() => {
      if (props.cardType === CardType.USER) return '个人名片'
      if (props.cardType === CardType.GROUP) return '群名片'
      if (props.cardType === CardType.CIRCLE) return '圈子名片'
      return '名片'
    })

    const expired = computed(() => {
      if (!props.expireAt || props.expireAt <= 0) return false
      return Math.floor(Date.now() / 1000) >= props.expireAt
    })

    const primaryButtonText = computed(() => {
      if (props.cardType === CardType.USER) {
        return isFriend.value ? '发消息' : '查看资料'
      }
      if (alreadyJoined.value) {
        if (props.cardType === CardType.GROUP) return '进入群聊'
        if (props.cardType === CardType.CIRCLE) return '进入圈子'
        return '已加入'
      }
      return '加入'
    })

    const reset = () => {
      loading.value = false
      joining.value = false
      loadError.value = ''
      name.value = ''
      avatar.value = ''
      desc.value = ''
      alreadyJoined.value = false
      isFriend.value = false
      conversationId.value = ''
    }

    const normalizeGroupId = (id: string) => (
      id.startsWith('group_') ? id.slice('group_'.length) : id
    )

    const load = async () => {
      if (!props.id) {
        loadError.value = '名片信息不完整'
        return
      }
      loading.value = true
      loadError.value = ''
      try {
        if (props.cardType === CardType.USER) {
          const user = contactStore.getContact(props.id)
          name.value = user.nickName || '用户'
          avatar.value = user.avatar || ''
          desc.value = user.abstract || '个人名片'
          isFriend.value = !!friendStore.getFriendByUserId(props.id)
        }
        else if (props.cardType === CardType.GROUP) {
          const groupId = normalizeGroupId(props.id)
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
          else if (!cached) {
            loadError.value = res.msg || '获取群信息失败'
          }
        }
        else if (props.cardType === CardType.CIRCLE) {
          conversationId.value = props.id.startsWith('circle_') ? props.id : `circle_${props.id}`
          const cached = circleStore.getCircleById(conversationId.value)
          if (cached) {
            name.value = cached.name || '圈子'
            avatar.value = cached.avatar || ''
            alreadyJoined.value = true
          }
          const res = await getCircleDetailApi({ circleId: props.id })
          if (res.code !== 0 || !res.result) {
            if (!cached)
              loadError.value = res.msg || '获取圈子信息失败'
          }
          else {
            name.value = res.result.name || name.value || '圈子'
            avatar.value = res.result.avatar || avatar.value
            desc.value = res.result.description
              || `${res.result.memberCount || 0} 位成员`
            alreadyJoined.value = (res.result.role || 0) > 0 || !!circleStore.getCircleById(conversationId.value)
          }
        }
        else {
          loadError.value = '暂不支持该名片类型'
        }
      }
      catch {
        loadError.value = '加载失败'
      }
      finally {
        loading.value = false
      }
    }

    watch(() => props.modelValue, (val) => {
      if (val) {
        reset()
        load()
      }
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
      if (!props.id)
        return
      const conversationId = props.id.startsWith('circle_') ? props.id : `circle_${props.id}`
      await circleStore.init()
      await messageViewStore.setCurrentChat(conversationId)
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
          const groupId = normalizeGroupId(props.id)
          const res = await joinGroupApi({ groupId })
          if (res.code === 0) {
            Message.success('已加入群聊')
            alreadyJoined.value = true
            await groupStore.init()
            openGroupChat()
          }
          else {
            Message.error(res.msg || '加入失败')
          }
        }
        else if (props.cardType === CardType.CIRCLE) {
          const res = await joinCircleApi({ circleId: props.id })
          if (res.code === 0) {
            const status = res.result?.status ?? 1
            if (status === 0) {
              Message.success('申请已提交，等待圈主审批')
              handleClose()
            }
            else {
              Message.success('已加入圈子')
              alreadyJoined.value = true
              await circleStore.init()
              await conversationStore.initConversationById(`circle_${props.id}`)
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
      loading,
      joining,
      loadError,
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
  padding: 8px 0 4px;
  min-height: 160px;
}

.card-preview-loading,
.card-preview-error {
  padding: 40px 0;
  color: #636E72;
  font-size: 13px;
}

.card-preview-error {
  color: #F44336;
}

:deep(.card-preview-avatar) {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
}

.card-preview-name {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #2D3436;
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
