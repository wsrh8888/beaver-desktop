<template>
  <div class="search__content">
    <!-- 标题栏 -->
    <div class="titlebar">
      <div class="title">
        搜索
      </div>
      <button class="close-btn" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="search__main">
      <SearchView />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SearchView from './views/index.vue'

export default defineComponent({
  components: {
    SearchView,
  },
  props: {
    searchOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const handleClose = () => {
      electron?.window.closeWindow('search', { hideOnly: true, isSelf: true })
    }
    return {
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.search__content {
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
  background-color: #F9FAFB;
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
    color: #2D3436;
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

// 主要内容区域
.search__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag;
  padding: 0 16px;
}
</style>
