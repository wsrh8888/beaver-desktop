<template>
  <header class="title-bar">
    <div class="title-bar-left">
      
    </div>
    
    <div class="window-controls">
      <div class="window-control-button minimize" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
      </div>
      <div class="window-control-button maximize" @click="handleMaximize">
        <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
      </div>
      <div class="window-control-button close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import { ipcRenderer } from 'electron';

export default defineComponent({
  setup() {
    const handleMinimize = () => {
    };

    const handleMaximize = () => {
    };

    const handleClose = () => {
    };

    return {
      handleMinimize,
      handleMaximize,
      handleClose
    };
  }
});
</script>

<style lang="less" scoped>
.title-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding: 0 16px;
  background: #FFFFFF;
  -webkit-app-region: drag;
  border-bottom: 1px solid #EBEEF5;

  .title-bar-left {
    display: flex;
    align-items: center;
  }



  .app-title {
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
  }

  .window-controls {
    display: flex;
    -webkit-app-region: no-drag;
  }

  .window-control-button {
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
      background: rgba(0,0,0,0.05);
    }

    &.close:hover {
      background: #FF5252;
      color: white;
    }
  }
}
</style>