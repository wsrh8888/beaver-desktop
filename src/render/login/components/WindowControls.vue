<template>
  <div class="window-controls app__drag">
    <div class="control-buttons app__no_drag">
      <div class="control-button close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WindowControls',
  setup() {
    const handleClose = () => {
      window.electron.window.closeWindow('login', { hideOnly: false })
    }

    return {
      handleClose,
    }
  },
})
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
    justify-content: center;
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
    &:hover {
      background: rgba(0,0,0,0.05);
    }
  }
}
</style>
