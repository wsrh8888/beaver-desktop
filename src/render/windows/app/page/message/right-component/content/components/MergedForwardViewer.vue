<template>
  <BeaverDialog v-model="visible" :title="details?.title || '聊天记录'" width="450px" @close="handleClose">
    <div class="mfv-container">
      <div v-if="loading" class="mfv-loading">
        加载中...
      </div>
      <div v-else-if="details" class="mfv-list">
        <div v-for="(item, i) in details.list" :key="i" class="mfv-item-wrapper">
          <div class="mfv-item-header">
            <span class="mfv-sender">{{ item.sender.nickName }}</span>
            <span class="mfv-time">{{ item.created_at }}</span>
          </div>
          <!-- 递归渲染消息组件，或者简单显示预览 -->
          <div class="mfv-content-body">
            {{ item.msg.textMsg?.content || '[其他消息类型]' }}
          </div>
        </div>
        <div v-if="!details.list?.length" class="mfv-empty">
          暂无消息记录
        </div>
      </div>
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import type { IForwardMessage, IGetForwardDetailsRes } from 'commonModule/type/ajax/chat'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { getForwardDetailsApi } from 'renderModule/api/chat'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'MergedForwardViewer',
  components: { BeaverDialog },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as () => IForwardMessage | null,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const loading = ref(false)
    const details = ref<IGetForwardDetailsRes | null>(null)

    const fetchDetails = async (recordId: string) => {
      loading.value = true
      try {
        const res = await getForwardDetailsApi({ recordId })
        details.value = res.result
      } catch (error) {
        console.error('获取合并转发详情失败:', error)
      } finally {
        loading.value = false
      }
    }

    watch(() => props.data?.recordId, (newId) => {
      if (newId && props.modelValue) {
        fetchDetails(newId)
      } else if (!newId) {
        details.value = null
      }
    })

    // 当弹窗打开时，如果已经有 recordId，也触发一次
    watch(() => props.modelValue, (val) => {
      if (val && props.data?.recordId && !details.value) {
        fetchDetails(props.data.recordId)
      }
    })

    const handleClose = () => {
      emit('update:modelValue', false)
      details.value = null
    }

    return { visible, handleClose, loading, details }
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
