<template>
  <div class="call-message">
    <span class="call-icon">音视频通话</span>
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'CallMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
})
</script>

<style lang="less" scoped>
.call-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #fff;

  .call-icon {
    padding: 4px;
  }
}
</style>
