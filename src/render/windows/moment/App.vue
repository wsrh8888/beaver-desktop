<template>
  <div class="moment__content">
    <!-- 标题栏 -->
    <div class="titlebar">
      <div class="title">
        朋友圈
      </div>
      <button class="close-btn" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="moment__main">
      <div class="moment-placeholder">
        <div class="placeholder-icon">
          <img src="renderModule/assets/image/leftBar/moment.svg" alt="朋友圈">
        </div>
        <div class="placeholder-text">
          朋友圈功能开发中...
        </div>
        <div class="placeholder-desc">
          这里将展示您的朋友圈动态
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const handleClose = () => {
      electron?.window.closeWindow('moment', { hideOnly: true })
    }

    return {
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.moment__content {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: drag;
}

/* 标题栏 */
.titlebar {
  height: 40px;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3748;
    -webkit-app-region: drag;
  }

  .close-btn {
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    &:hover img {
      opacity: 1;
    }
  }
}

/* 主要内容区域 */
.moment__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  justify-content: center;
}

.moment-placeholder {
  text-align: center;
  padding: 40px;

  .placeholder-icon {
    margin-bottom: 24px;

    img {
      width: 64px;
      height: 64px;
      opacity: 0.6;
    }
  }

  .placeholder-text {
    font-size: 18px;
    font-weight: 500;
    color: #2D3748;
    margin-bottom: 8px;
  }

  .placeholder-desc {
    font-size: 14px;
    color: #718096;
  }
}
</style>
