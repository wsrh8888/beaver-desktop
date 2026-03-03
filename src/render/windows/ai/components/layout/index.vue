<template>
  <div class="ai-layout">
    <header class="ai-layout__titlebar">
      <div class="ai-layout__titlebar-drag" />
      <div class="ai-layout__window-controls">
        <div class="ai-layout__control-btn minimize" @click="handleMinimize">
          <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
        </div>
        <div class="ai-layout__control-btn maximize" @click="handleMaximize">
          <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
        </div>
        <div class="ai-layout__control-btn close" @click="handleClose">
          <img src="renderModule/assets/image/header/close.svg" alt="close">
        </div>
      </div>
    </header>

    <div class="ai-layout__body">
      <div class="ai-layout__left">
        <slot name="left" />
      </div>

      <main class="ai-layout__right">
        <slot name="right" />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiLayout',
  setup() {
    const handleMinimize = () => {
      window.electron.window.minimize()
    }

    const handleMaximize = () => {
      window.electron.window.maximize()
    }

    const handleClose = () => {
      window.electron.window.closeWindow('ai', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleMaximize,
      handleClose
    }
  }
})
</script>

<style lang="less" scoped>
.ai-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;

  .ai-layout__titlebar {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF;
    border-bottom: 1px solid #EBEEF5;
    -webkit-app-region: drag;
    flex-shrink: 0;

    .ai-layout__titlebar-drag {
      flex: 1;
    }

    .ai-layout__window-controls {
      display: flex;
      -webkit-app-region: no-drag;
    }

    .ai-layout__control-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #636E72;

      img {
        width: 12px;
        height: 12px;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      &.close:hover {
        background: #FF5252;
        color: #FFFFFF;
      }
    }
  }

  .ai-layout__body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .ai-layout__nav {
    width: 68px;
    flex-shrink: 0;
    background: #F9FAFB;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 16px;

    .ai-layout__nav-logo {
      width: 40px;
      height: 40px;

      img {
        width: 40px;
        height: 40px;
        display: block;
      }
    }
  }

  .ai-layout__left {
    width: 280px;
    flex-shrink: 0;
    background: #FFFFFF;
    border-right: 1px solid #EBEEF5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ai-layout__right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    overflow: hidden;
  }
}
</style>
