<template>
  <div v-if="messageViewStore.editingTo" class="edit-bar">
    <div class="edit-info">
      <span class="edit-label">编辑消息：</span>
      <span class="edit-preview">{{ previewText }}</span>
    </div>
    <button class="edit-close" @click="messageViewStore.setEditingTo(null)">
      ×
    </button>
  </div>
</template>

<script lang="ts">
import { MessageType } from 'commonModule/type/ajax/chat'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'EditBar',
  setup() {
    const messageViewStore = useMessageViewStore()

    const previewText = computed(() => {
      const msg = messageViewStore.editingTo?.msg
      if (!msg) return ''

      if (msg.type === MessageType.TEXT)
        return msg.textMsg?.content?.slice(0, 50) || '[文本]'
      if (msg.type === 13)
        return msg.markdownMsg?.content?.slice(0, 50) || '[Markdown]'
      return '[消息]'
    })

    return {
      messageViewStore,
      previewText,
    }
  },
})
</script>

<style lang="less" scoped>
.edit-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #F5F6FA;
  border-left: 3px solid #FF7D45;
  border-top: 1px solid #EBEEF5;
  gap: 8px;

  .edit-info {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    gap: 4px;
    align-items: center;

    .edit-label {
      color: #FF7D45;
      flex-shrink: 0;
      font-weight: 500;
    }

    .edit-preview {
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .edit-close {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #909399;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #606266;
    }
  }
}
</style>
