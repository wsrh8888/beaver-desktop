<template>
  <div v-if="messageViewStore.isMultiSelectMode" class="multi-select-bar">
    <button class="ms-cancel-btn" @click="messageViewStore.exitMultiSelect()">取消</button>
    <span class="ms-count">已选 {{ messageViewStore.selectedMessageIds.length }} 条</span>
    <div class="ms-actions">
      <button class="ms-action-btn" :disabled="messageViewStore.selectedMessageIds.length === 0"
        @click="handleBatchForward('each')">
        逐条转发
      </button>
      <button class="ms-action-btn" :disabled="messageViewStore.selectedMessageIds.length === 0"
        @click="handleBatchForward('merged')">
        合并转发
      </button>
      <button class="ms-action-btn ms-delete-btn" :disabled="messageViewStore.selectedMessageIds.length === 0"
        @click="handleBatchDelete">
        删除
      </button>
    </div>

    <!-- 批量转发对话框 -->
    <BatchForwardDialog v-model="batchForwardVisible" :message-ids="[...messageViewStore.selectedMessageIds]"
      :mode="batchForwardMode" :merged-title="mergedTitle" @done="messageViewStore.exitMultiSelect()" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { useMessageStore } from 'renderModule/windows/app/pinia/message/message'
import { deleteMessagesApi } from 'renderModule/api/chat'
import Message from 'renderModule/components/ui/message'
import BatchForwardDialog from '../BatchForwardDialog.vue'

export default defineComponent({
  name: 'MultiActions',
  components: {
    BatchForwardDialog
  },
  setup() {
    const messageViewStore = useMessageViewStore()
    const messageStore = useMessageStore()

    const batchForwardVisible = ref(false)
    const batchForwardMode = ref<'each' | 'merged'>('each')
    const mergedTitle = ref('聊天记录')

    const handleBatchForward = (mode: 'each' | 'merged') => {
      if (messageViewStore.selectedMessageIds.length === 0) return

      if (mode === 'merged') {
        const conversationId = messageViewStore.currentChatId
        if (conversationId) {
          const history = messageStore.getChatHistory(conversationId)
          const selectedIds = messageViewStore.selectedMessageIds
          const names = [...new Set(
            history
              .filter(m => selectedIds.includes(m.messageId))
              .map(m => m.sender.nickName),
          )].slice(0, 2).join('、')
          mergedTitle.value = names ? `${names}的聊天记录` : '聊天记录'
        }
      }
      batchForwardMode.value = mode
      batchForwardVisible.value = true
    }

    const handleBatchDelete = async () => {
      const ids = [...messageViewStore.selectedMessageIds]
      const conversationId = messageViewStore.currentChatId
      if (!conversationId || ids.length === 0) return

      try {
        const res = await deleteMessagesApi({ messageIds: ids })
        if (res.code === 0) {
          await messageStore.removeMessages(conversationId, ids)
          messageViewStore.exitMultiSelect()
          Message.success(`已删除 ${ids.length} 条消息`)
        } else {
          Message.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        Message.error('删除操作异常')
      }
    }

    return {
      messageViewStore,
      batchForwardVisible,
      batchForwardMode,
      mergedTitle,
      handleBatchForward,
      handleBatchDelete
    }
  }
})
</script>

<style lang="less" scoped>
.multi-select-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 52px;
  background: #fff;
  border-top: 1px solid #EBEEF5;
  gap: 12px;

  .ms-cancel-btn {
    flex-shrink: 0;
    padding: 6px 14px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    background: #fff;
    font-size: 13px;
    color: #606266;
    cursor: pointer;

    &:hover {
      background: #F5F6FA;
    }
  }

  .ms-count {
    flex: 1;
    font-size: 13px;
    color: #909399;
    text-align: center;
  }

  .ms-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .ms-action-btn {
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      background: #FF7D45;
      color: #fff;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: #FF6B3D;
      }

      &:disabled {
        background: #B2BEC3;
        cursor: not-allowed;
      }

      &.ms-delete-btn {
        background: #fff;
        border: 1px solid #EBEEF5;
        color: #F56C6C;

        &:hover:not(:disabled) {
          background: #FEF0F0;
          border-color: #F56C6C;
        }

        &:disabled {
          background: #fff;
          color: #C0C4CC;
          border-color: #EBEEF5;
        }
      }
    }
  }
}
</style>
