<template>
  <div class="settings-header">
    <div class="settings-header__title">
      设置
    </div>
    <div class="settings-header__controls">
      <button class="settings-header__btn" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="settings-header__btn settings-header__btn--close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsHeader',
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('settings', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-header {
  height: 40px;
  background: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  -webkit-app-region: drag;

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
    -webkit-app-region: no-drag;
  }

  &__btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    img {
      width: 12px;
      height: 12px;
      opacity: 0.7;
    }

    &:hover {
      background: #F9FAFB;
    }

    &--close:hover {
      background: #FFE6E6;
    }
  }
}
</style>
