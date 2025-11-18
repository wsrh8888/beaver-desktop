<template>
  <div class="about-overlay" @click.self="handleClose">
    <div class="about-panel" @click.stop>
      <!-- 关闭按钮 -->
      <div class="close-button" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </div>

      <!-- 内容区域 -->
      <div class="about-content">
        <!-- Logo -->
        <div class="logo-section">
          <img src="commonModule/assets/img/logo/logo.png" alt="Beaver Logo" class="logo">
        </div>

        <!-- 名称 -->
        <div class="app-name">
          海狸IM
        </div>

        <!-- 版本号 -->
        <div class="app-version">
          版本 {{ currentVersion }}
        </div>

        <!-- 检查更新按钮 -->
        <BeaverButton type="primary" class="update-button" @click="handleCheckUpdate">
          检查更新
        </BeaverButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import { computed, defineComponent } from 'vue'
import { useGlobalStore } from 'renderModule/windows/app/pinia/view/global/index'
import { useUpdateStore } from 'renderModule/windows/app/pinia/update/index'

export default defineComponent({
  name: 'AboutComponent',
  components: {
    BeaverButton,
  },
  emits: ['close'],
  setup(props, { emit }) {
    const globalStore = useGlobalStore()
    const updateStore = useUpdateStore()


    const handleClose = () => {
      globalStore.setComponent(null)
      emit('close')
    }

    const handleCheckUpdate = async () => {
      await updateStore.checkUpdate()

      // 如果有更新，打开升级窗口
      if (updateStore.updateInfo.hasUpdate) {
        updateStore.startUpdate()
      }
    }

    const currentVersion = computed(() => electron?.app.version)

    return {
      handleClose,
      handleCheckUpdate,
      currentVersion
    }
  },
})
</script>

<style lang="less" scoped>
.about-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.about-panel {
  position: relative;
  width: 320px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #F5F5F5;
  }

  img {
    width: 20px;
    height: 20px;
  }
}

.about-content {
  padding: 40px 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  margin-bottom: 24px;

  .logo {
    width: 80px;
    height: 80px;
  }
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #636E72;
  margin-bottom: 32px;
}

.update-button {
  width: 160px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
}
</style>

