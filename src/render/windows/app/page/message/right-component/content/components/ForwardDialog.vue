<template>
  <BeaverDialog v-model="visible" title="选择转发对象" width="360px" @close="handleClose">
    <div class="forward-dialog">
      <input v-model="searchText" class="search-input" placeholder="搜索会话" type="text">
      <div class="conversation-list">
        <div v-for="item in filteredList" :key="item.conversationId" class="conversation-item"
          :class="{ selected: selectedId === item.conversationId }" @click="selectedId = item.conversationId">
          <BeaverImage :file-name="item.avatar" :cache-type="CacheType.USER_AVATAR" :alt="item.nickName"
            image-class="item-avatar" />
          <span class="item-name">{{ item.nickName }}</span>
          <span v-if="selectedId === item.conversationId" class="check-icon">✓</span>
        </div>
        <div v-if="filteredList.length === 0" class="empty-tip">
          暂无会话
        </div>
      </div>
    </div>
    <template #footer>
      <BeaverButton type="default" @click="handleClose">
        取消
      </BeaverButton>
      <BeaverButton type="primary" :disabled="!selectedId" style="margin-left:8px" @click="handleConfirm">
        转发
      </BeaverButton>
    </template>
  </BeaverDialog>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { forwardMessageApi } from 'renderModule/api/chat'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ForwardDialog',
  components: { BeaverDialog, BeaverButton, BeaverImage },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    messageId: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const conversationStore = useConversationStore()
    const searchText = ref('')
    const selectedId = ref<string>('')

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const filteredList = computed(() => {
      const list = conversationStore.conversations
      if (!searchText.value.trim())
        return list
      const kw = searchText.value.toLowerCase()
      return list.filter(c => c.nickName?.toLowerCase().includes(kw))
    })

    const handleClose = () => {
      selectedId.value = ''
      searchText.value = ''
      emit('update:modelValue', false)
    }

    const handleConfirm = async () => {
      if (!selectedId.value || !props.messageId)
        return
      const target = conversationStore.conversations.find(c => c.conversationId === selectedId.value)
      const forwardType = target?.chatType === 2 ? 2 : 1
      try {
        const res = await forwardMessageApi({
          messageIds: [props.messageId],
          targetId: selectedId.value,
          forwardType,
          forwardMode: 1, // 逐条转发
        })
        if (res.code === 0) {
          Message.success('已转发')
          handleClose()
        }
        else {
          Message.error('转发失败')
        }
      }
      catch {
        Message.error('转发失败')
      }
    }

    return {
      CacheType,
      visible,
      searchText,
      selectedId,
      filteredList,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<style lang="less" scoped>
.forward-dialog {
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
