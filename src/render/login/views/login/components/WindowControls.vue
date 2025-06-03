<template>
  <div class="window-controls app__drag">
    <div class="control-buttons app__no_drag">
      <div class="control-button minimize" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
      </div>
      <div class="control-button maximize" @click="handleMaximize">
        <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
      </div>
      <div class="control-button close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WindowControls',
  setup() {
    const handleClose = () => {
      electron.closeWindow();
    };

    const handleMinimize = () => {
      // 实现最小化逻辑
    };

    const handleMaximize = () => {
      // 实现最大化逻辑
    };

    return {
      handleClose,
      handleMinimize,
      handleMaximize
    };
  }
});
</script>

<style lang="less" scoped>
.window-controls {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: var(--height-header);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--spacing-2);
  z-index: 1000;
  -webkit-app-region: drag;

  .control-buttons {
    display: flex;
    gap: var(--spacing-1);
    -webkit-app-region: no-drag;
  }

  .control-button {
    width: var(--size-icon-lg);
    height: var(--size-icon-lg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: transparent;

    img {
      width: var(--size-icon-sm);
      height: var(--size-icon-sm);
      opacity: 0.7;
      transition: opacity var(--transition-fast);
    }

    &:hover img {
      opacity: 1;
    }

    &.minimize {
      background-color: #FFBD2E;
      &:hover {
        background-color: #FFD166;
      }
    }

    &.maximize {
      background-color: #28C940;
      &:hover {
        background-color: #4CAF50;
      }
    }

    &.close {
      background-color: #FF5F57;
      &:hover {
        background-color: #FF5252;
      }
    }
  }
}
</style>
