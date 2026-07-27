<template>
  <BeaverDialog v-model="visible" :title="title" width="360px" @close="handleClose">
    <div class="share-dialog">
      <input v-model="searchText" class="search-input" placeholder="搜索会话" type="text">
      <div class="conversation-list">
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
            <BeaverImage
              :file-name="item.avatar"
              :cache-type="CacheType.USER_AVATAR"
              :alt="item.nickName"
              image-class="item-avatar"
            />
            <span class="item-name">{{ item.nickName }}</span>
            <span v-if="selectedId === item.conversationId" class="check-icon">✓</span>
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
        :disabled="!selectedId || sending"
        style="margin-left:8px"
        @click="handleConfirm"
      >
        发送
      </BeaverButton>
    </template>
  </BeaverDialog>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { getRecentChatListApi } from 'renderModule/api/chat'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { ChatCore } from 'renderModule/core/message/index'
import { computed, defineComponent, PropType, ref, watch } from 'vue'

export default defineComponent({
  name: 'ShareToConversationDialog',
  components: { BeaverDialog, BeaverButton, BeaverImage },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '发送到',
    },
    msg: {
      type: Object as PropType<IMessageMsg | null>,
      default: null,
    },
  },
  emits: ['update:modelValue', 'sent'],
  setup(props, { emit }) {
    const searchText = ref('')
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
      if (!searchText.value.trim())
        return list
      const kw = searchText.value.toLowerCase()
      return list.filter(c => c.nickName?.toLowerCase().includes(kw))
    })

    const loadConversations = async () => {
      loading.value = true
      try {
        const res = await getRecentChatListApi({ page: 1, limit: 100 })
        if (res.code === 0)
          conversations.value = res.result.list || []
        else
          conversations.value = []
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
        loadConversations()
      }
      else {
        selectedId.value = ''
        searchText.value = ''
        sending.value = false
      }
    })

    const handleClose = () => {
      emit('update:modelValue', false)
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
      searchText,
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
.share-dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .search-input {
    width: 100%;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #FF7D45;
    }
  }

  .conversation-list {
    max-height: 280px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      padding: 8px 4px;
      border-radius: 6px;
      cursor: pointer;
      gap: 10px;

      &:hover {
        background: #F5F6FA;
      }

      &.selected {
        background: #FFF1EB;
      }

      :deep(.item-avatar) {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .item-name {
        flex: 1;
        font-size: 13px;
        color: #2D3436;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .check-icon {
        color: #FF7D45;
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
      }
    }

    .empty-tip {
      text-align: center;
      color: #B2BEC3;
      font-size: 13px;
      padding: 20px 0;
    }
  }
}
</style>
