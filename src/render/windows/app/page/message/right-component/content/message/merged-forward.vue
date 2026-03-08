<template>
  <div class="merged-forward-bubble" @click="handleView">
    <div class="mf-title">{{ msg.forwardMsg?.title }}</div>
    <div class="mf-count">共 {{ msg.forwardMsg?.count || 0 }} 条聊天记录</div>
    <div class="mf-divider" />
    <div class="mf-link">
      <span>查看聊天记录</span>
      <img class="mf-arrow" src="renderModule/assets/images/chat/chevron-right.svg" alt="">
    </div>
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { defineComponent, PropType } from 'vue'
import { useForwardViewStore } from 'renderModule/windows/app/pinia/view/message/forward'

export default defineComponent({
  name: 'MergedForwardMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    const forwardViewStore = useForwardViewStore()

    const handleView = () => {
      const recordId = props.msg.forwardMsg?.recordId
      if (recordId) {
        forwardViewStore.open(recordId)
      }
    }

    return {
      handleView
    }
  },
})
</script>

<style lang="less" scoped>
.merged-forward-bubble {
  min-width: 160px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
  }

  .mf-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .mf-count {
    font-size: 12px;
    opacity: 0.6;
  }

  .mf-divider {
    height: 1px;
    background: currentColor;
    opacity: 0.12;
    margin: 8px 0;
  }

  .mf-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    opacity: 0.55;
    font-weight: 500;

    .mf-arrow {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      filter: brightness(0) opacity(0.4);
    }
  }
}
</style>
