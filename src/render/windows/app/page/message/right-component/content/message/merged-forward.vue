<template>
  <div class="merged-forward-bubble" @click="$emit('view', message.msg.mergedForwardMsg)">
    <div class="mf-title">{{ message.msg.mergedForwardMsg.title }}</div>
    <div v-for="(item, i) in previewItems" :key="i" class="mf-item">
      <span class="mf-sender">{{ item.senderName }}：</span>
      <span class="mf-content">{{ item.content }}</span>
    </div>
    <div class="mf-divider" />
    <div class="mf-link">查看聊天记录</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MergedForwardMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ['view'],
  setup(props) {
    const previewItems = computed(() => {
      return (props.message.msg.mergedForwardMsg?.messages ?? []).slice(0, 4)
    })
    return { previewItems }
  },
})
</script>

<style lang="less" scoped>
.merged-forward-bubble {
  min-width: 180px;
  max-width: 240px;
  cursor: pointer;
  user-select: none;

  .mf-title {
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mf-item {
    font-size: 12px;
    color: #636E72;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .mf-sender {
      color: #2D3436;
    }

    .mf-content {
      color: #909399;
    }
  }

  .mf-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.08);
    margin: 6px 0;
  }

  .mf-link {
    font-size: 12px;
    color: #909399;
  }

  &:hover .mf-link {
    color: #636E72;
  }
}
</style>
