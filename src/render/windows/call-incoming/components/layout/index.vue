<template>
  <div class="incoming-layout">
    <div class="close-btn" @click="handleClose">
      <img src="renderModule/assets/image/header/close.svg" alt="close">
    </div>
    <div class="content-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IncomingLayout',
  setup() {
    const handleClose = () => {
      (window as any).electron?.window.closeWindow()
    }
    return { handleClose }
  }
})
</script>

<style lang="less" scoped>
.incoming-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    border-radius: 4px;
    transition: background 0.2s;

    img {
      width: 12px;
      height: 12px;
      opacity: 0.5;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);

      img {
        opacity: 0.8;
      }
    }
  }

  .content-body {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
