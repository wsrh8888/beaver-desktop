<template>
  <div class="call-layout">
    <!-- 1. 顶部原生标题栏：负责拖拽和基础窗口控制 -->
    <header class="call-layout__titlebar">
      <div class="call-layout__titlebar-drag">
        <span class="title">海狸会议</span>
      </div>
      <div class="call-layout__window-controls">
        <div class="control-btn minimize" @click="handleMinimize" title="最小化">
          <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
        </div>
        <div class="control-btn maximize" @click="handleMaximize" title="最大化">
          <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
        </div>
        <div class="control-btn close" @click="handleClose" title="关闭">
          <img src="renderModule/assets/image/header/close.svg" alt="close">
        </div>
      </div>
    </header>
    <!-- 3. 主体区域 -->
    <div class="call-layout__body">
      <div class="call-layout__content">
        <slot name="content" />
      </div>
    </div>

    <!-- 4. 底部操作栏 -->
    <footer class="call-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { usecallStore } from '../../pinia/call'

export default defineComponent({
  name: 'CallLayout',
  setup() {
    const callStore = usecallStore()
    const title = computed(() => callStore.baseInfo.roomName || '知音楼会议')

    const handleMinimize = () => {
      (window as any).electron?.window.minimize()
    }

    const handleMaximize = () => {
      (window as any).electron?.window.maximize()
    }

    const handleClose = () => {
      // 这里的逻辑可以根据业务调整为挂断或仅隐藏
      (window as any).electron?.window.closeWindow('call', { hideOnly: true })
    }

    return {
      title,
      handleMinimize,
      handleMaximize,
      handleClose
    }
  }
})
</script>

<style lang="less" scoped>
.call-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;

  .call-layout__titlebar {
    height: 32px;
    display: flex;
    align-items: center;
    background: #fff;
    -webkit-app-region: drag;
    flex-shrink: 0;

    .call-layout__titlebar-drag {
      flex: 1;
      display: flex;
      justify-content: center;
      padding-left: 120px; // 留出左侧平衡感

      .title {
        font-size: 13px;
        color: #333;
      }
    }

    .call-layout__window-controls {
      display: flex;
      -webkit-app-region: no-drag;

      .control-btn {
        width: 40px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;

        img {
          width: 12px;
          height: 12px;
          // filter: invert(0); // 黑色图标在白底
        }

        &:hover {
          background: #f5f5f5;
        }

        &.close:hover {
          background: #ff5252;

          img {
            filter: invert(1);
          }
        }
      }
    }
  }

  .call-layout__header {
    height: 40px;
    flex-shrink: 0;
    z-index: 100;
  }

  .call-layout__body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;

    .call-layout__content {
      flex: 1;
      min-width: 0;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .call-layout__sidebar {
      width: 280px;
      flex-shrink: 0;
      background: #fff;
      border-left: 1px solid #ebedf0;
      display: flex;
      flex-direction: column;
    }
  }

  .call-layout__footer {
    height: 80px;
    flex-shrink: 0;
    z-index: 100;
  }
}
</style>
