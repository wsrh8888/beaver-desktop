<template>
  <div class="call-message">
    <div class="call-content">
      <img class="call-icon" src="renderModule/assets/images/chat/call.svg" alt="通话" />
      <span>音视频通话</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CallMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
})
</script>

<style lang="less" scoped>
.call-message {
  padding: 4px 8px;

  .call-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #2D3436;

    .call-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
  }
}
</style>
