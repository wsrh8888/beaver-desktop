<template>
  <div class="window-controls app__drag">
    <div class="control-buttons app__no_drag">
      <div class="control-btn control-close" @click="handleClose"></div>
      <div class="control-btn control-minimize" @click="handleMinimize"></div>
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
      electron.minimizeWindow();
    };

    return {
      handleClose,
      handleMinimize
    };
  }
});
</script>

<style lang="less" scoped>
.window-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;

  .control-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.15);
    }

    &.control-close {
      background-color: #FF5252;
    }

    &.control-minimize {
      background-color: #FFC107;
    }
  }
}
</style>
