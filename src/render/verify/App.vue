<template>
  <div class="verify__content">
    <!-- 标题栏 -->
    <div class="titlebar">
      <div class="title">
        {{ windowTitle }}
      </div>
      <button class="close-btn" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="verify__main">
      <AddFriendComponent v-if="verifyType === 'friend'" :target-value="targetValue" @close="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
// import { NotificationEvent } from 'commonModule/type/preload/notification'
import { computed, defineComponent } from 'vue'
import AddFriendComponent from './components/add-friend.vue'
import { useVerifyStore } from './pinia/verify'

export default defineComponent({
  components: {
    AddFriendComponent,
  },
  setup() {
    // 使用pinia store
    const verifyStore = useVerifyStore()

    const handleClose = async () => {
      // 清除缓存中的数据
      await electron.storage.removeAsync('searchResults')
      // 隐藏窗口
      electron.window.closeWindow('verify', { hideOnly: true, isSelf: true })
    }

    return {
      targetValue: computed(() => verifyStore.searchData),
      windowTitle: computed(() => verifyStore.verifyType === 'friend' ? '添加好友' : '添加群组'),
      verifyType: computed(() => verifyStore.verifyType),
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.verify__content {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: drag; // 允许整个窗口拖动
}

/* 顶部标题栏 */
.titlebar {
  height: 40px;
  background-color: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag; // 可拖动区域
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
    -webkit-app-region: drag; // 标题部分也可拖动
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
    -webkit-app-region: no-drag; // 关闭按钮不可拖动

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
.verify__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag; // 内容区域不可拖动
}
</style>
