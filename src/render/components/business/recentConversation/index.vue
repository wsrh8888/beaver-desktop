<template>
  <div class="recent-conversation">
    <BeaverDialog
      v-model="visible"
      :title="title"
      width="420px"
      @close="handleClose"
    >
      <div class="recent-conversation-body">
        <div class="recent-conversation-search">
          <img class="search-icon" src="renderModule/assets/image/create-group/search.svg" alt="搜索">
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="搜索会话"
          >
        </div>

        <div class="recent-conversation-list">
          <div v-if="loading" class="empty-tip">
            加载中...
          </div>
          <template v-else>
            <div
              v-for="item in filteredList"
              :key="item.conversationId"
              class="conversation-item"
              :class="{ selected: selectedId === item.conversationId }"
              @click="selectedId = item.conversationId"
            >
              <div class="conversation-avatar">
                <BeaverImage
                  :file-name="item.avatar"
                  :cache-type="CacheType.USER_AVATAR"
                  :alt="item.nickName"
                />
              </div>
              <div class="conversation-name">
                {{ item.nickName }}
              </div>
              <div class="conversation-check">
                <img
                  v-if="selectedId === item.conversationId"
                  src="renderModule/assets/image/create-group/check.svg"
                  alt="选中"
                >
              </div>
            </div>
            <div v-if="filteredList.length === 0" class="empty-tip">
              暂无会话
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <BeaverButton type="default" @click="handleClose">
          取消
        </BeaverButton>
        <BeaverButton
          type="primary"
          style="margin-left: 8px"
          :disabled="!selectedId || sending"
          @click="handleConfirm"
        >
          {{ sending ? '发送中...' : '发送' }}
        </BeaverButton>
      </template>
    </BeaverDialog>
  </div>
</template>

<script lang="ts">
import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { CacheType } from 'commonModule/type/cache/cache'
import { computed, defineComponent, type PropType, ref, watch } from 'vue'
import { getRecentChatListApi } from 'renderModule/api/chat'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { ChatCore } from 'renderModule/core/message/index'

export default defineComponent({
  name: 'RecentConversation',
  components: { BeaverDialog, BeaverButton, BeaverImage },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '选择会话',
    },
    msg: {
      type: Object as PropType<IMessageMsg | null>,
      default: null,
    },
  },
  emits: ['update:modelValue', 'close', 'sent'],
  setup(props, { emit }) {
    const searchKeyword = ref('')
    const selectedId = ref('')
    const sending = ref(false)
    const loading = ref(false)
    const conversations = ref<IConversationInfoRes[]>([])

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const filteredList = computed(() => {
      const list = conversations.value
      if (!searchKeyword.value.trim())
        return list
      const kw = searchKeyword.value.toLowerCase()
      return list.filter(c => c.nickName?.toLowerCase().includes(kw))
    })

    const loadConversations = async () => {
      loading.value = true
      try {
        const res = await getRecentChatListApi({ page: 1, limit: 100 })
        conversations.value = res.code === 0 ? (res.result.list || []) : []
      }
      catch {
        conversations.value = []
      }
      finally {
        loading.value = false
      }
    }

    watch(() => props.modelValue, (val) => {
      if (val) {
        selectedId.value = ''
        searchKeyword.value = ''
        sending.value = false
        loadConversations()
      }
    })

    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    const handleConfirm = async () => {
      if (!selectedId.value || !props.msg || sending.value)
        return
      const target = conversations.value.find(c => c.conversationId === selectedId.value)
      const chatType = target?.chatType === 2 ? 'group' : 'private'
      sending.value = true
      try {
        await ChatCore.sendMessage(selectedId.value, props.msg, chatType)
        Message.success('已发送')
        emit('sent')
        handleClose()
      }
      catch {
        Message.error('发送失败')
      }
      finally {
        sending.value = false
      }
    }

    return {
      CacheType,
      visible,
      searchKeyword,
      selectedId,
      sending,
      loading,
      filteredList,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<style lang="less" scoped>
.recent-conversation {
  pointer-events: auto;
}

.recent-conversation-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-conversation-search {
  position: relative;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    opacity: 0.45;
  }

  .search-input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 36px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #FF7D45;
    }
  }
}

.recent-conversation-list {
  min-height: 240px;
  max-height: 360px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #F5F6FA;
  }

  &.selected {
    background: #FFF1EB;
  }
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F0F2F5;
}

.conversation-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
  }
}

.empty-tip {
  text-align: center;
  color: #B2BEC3;
  font-size: 13px;
  padding: 40px 0;
}
</style>
