<template>
  <div class="call-header">
    <div class="call-title">
      <span>Beaver 通话</span>
    </div>
    <div class="window-actions">
      <div class="action-btn" @click="handleMinimize">
        <img src="renderModule/assets/image/call/minimize.svg" alt="最小化">
      </div>
      <div class="action-btn close" @click="handleHangup">
        <img src="renderModule/assets/image/call/close.svg" alt="关闭">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CallHeader',
  setup() {
    const handleMinimize = () => {
      (window as any).electron?.window.minimize()
    }

    const handleHangup = () => {
      (window as any).electron?.window.closeWindow('call')
    }

    return {
      handleMinimize,
      handleHangup
    }
  }
})
</script>

<style lang="less" scoped>
.call-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
  z-index: 10;

  .call-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.8;

    .logo {
      width: 24px;
      height: 24px;
    }
  }

  .window-actions {
    display: flex;
    gap: 8px;
    -webkit-app-region: no-drag;

    .action-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.close:hover {
        background: #ff5252;
      }

      img {
        width: 16px;
        height: 16px;
        filter: invert(1);
      }
    }
  }
}
</style>
