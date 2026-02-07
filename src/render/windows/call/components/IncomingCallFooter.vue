<template>
  <div class="incoming-footer">
    <div class="action-group">
      <!-- 拒绝/挂断 -->
      <div class="action-item reject" @click="callManager.hangup()">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/hangup.svg" alt="拒绝">
        </div>
        <span>拒绝</span>
      </div>

      <!-- 接听 -->
      <div class="action-item accept" @click="callManager.acceptCall()">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/video.svg" alt="接听">
        </div>
        <span>接听</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import callManager from '../core'

export default defineComponent({
  name: 'IncomingCallFooter',
  setup() {
    return {
      callManager
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-footer {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .action-group {
    display: flex;
    gap: 80px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      color: #fff;
      font-size: 14px;

      &:hover .icon-circle {
        transform: scale(1.1);
      }

      .icon-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        img {
          width: 32px;
          height: 32px;
          filter: invert(1);
        }
      }

      &.reject .icon-circle {
        background: #ff5252;
        box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
      }

      &.accept .icon-circle {
        background: #00b894;
        box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);

        // 简单的呼吸灯效果，提示接听
        animation: pulse 2s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.7);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(0, 184, 148, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 184, 148, 0);
  }
}
</style>
