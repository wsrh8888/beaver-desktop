<template>
  <BeaverDialog v-model="visible" title="聊天记录" width="400px" @close="handleClose">
    <div class="mfv-container">
      <div class="mfv-header">{{ data?.title }}</div>
      <div class="mfv-list">
        <div v-for="(item, i) in data?.messages" :key="i" class="mfv-item">
          <span class="mfv-sender">{{ item.senderName }}：</span>
          <span class="mfv-content">{{ item.content }}</span>
        </div>
        <div v-if="!data?.messages?.length" class="mfv-empty">
          暂无消息记录
        </div>
      </div>
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import type { IMergedForwardMessage } from 'commonModule/type/ajax/chat'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MergedForwardViewer',
  components: { BeaverDialog },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as () => IMergedForwardMessage | null,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const handleClose = () => {
      emit('update:modelValue', false)
    }

    return { visible, handleClose }
  },
})
</script>

<style lang="less" scoped>
.mfv-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mfv-header {
  font-size: 13px;
  font-weight: 500;
  color: #636E72;
  padding-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
}

.mfv-list {
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
}

.mfv-item {
  padding: 6px 0;
  font-size: 13px;
  line-height: 1.5;
  border-bottom: 1px solid #F5F6FA;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .mfv-sender {
    color: #2D3436;
    font-weight: 500;
  }

  .mfv-content {
    color: #636E72;
  }
}

.mfv-empty {
  text-align: center;
  color: #B2BEC3;
  font-size: 13px;
  padding: 20px 0;
}
</style>
