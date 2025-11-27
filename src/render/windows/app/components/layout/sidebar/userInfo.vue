<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="userinfo-popup" @click.stop>
        <!-- 遮罩层 -->
        <div class="popup-overlay" @click="handleClose" />

        <!-- 弹窗内容 -->
        <div ref="popupRef" class="popup-content" :style="popupStyle">
          <!-- 头部：头像和昵称 -->
          <div class="popup-header">
            <div class="avatar-section">
              <BeaverImage
                :file-name="userInfo.avatar"
                :cache-type="CacheType.USER_AVATAR"
                image-class="avatar-image"
              />
            </div>
            <div class="user-name">
              {{ userInfo.nickName || '用户' }}
            </div>
            <div class="user-id">
              ID: {{ userInfo.userId }}
            </div>
          </div>

          <!-- 菜单列表 -->
          <div class="popup-menu">
            <div
              v-for="item in menuList"
              :key="item.key"
              class="menu-item"
              :class="{ 'menu-item-danger': item.key === 'logout' }"
              @click="handleMenuClick(item)"
            >
              <div class="menu-icon">
                <img :src="item.icon" :alt="item.label">
              </div>
              <div class="menu-label">
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import MessageBox from 'renderModule/components/ui/messagebox'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGlobalStore } from '../../../pinia/view/global/index'
import { userInfoMenuList } from './data'

export default defineComponent({
  name: 'UserInfoPopup',
  components: {
    BeaverImage,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    avatarElement: {
      type: Object as () => HTMLElement | null,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const globalStore = useGlobalStore()

    const userInfo = computed(() => userStore.userInfo)
    const menuList = userInfoMenuList
    const popupRef = ref<HTMLElement | null>(null)
    const popupStyle = ref({
      top: '0px',
      left: '0px',
    })

    // 计算弹窗位置
    const calculatePosition = () => {
      if (!props.avatarElement || !popupRef.value) {
        return
      }

      const avatarRect = props.avatarElement.getBoundingClientRect()
      const popupHeight = popupRef.value.offsetHeight || 200
      const sidebarWidth = 68 // 侧边栏宽度
      const gap = 10 // 距离侧边栏右边的距离
      const minTop = 10 // 最小距离顶部
      const windowHeight = window.innerHeight

      // 计算位置：侧边栏右边10px，头像垂直居中
      let top = avatarRect.top + avatarRect.height / 2 - popupHeight / 2
      const left = sidebarWidth + gap

      // 如果弹窗超出屏幕底部，调整位置
      if (top + popupHeight > windowHeight - 10) {
        top = windowHeight - popupHeight - 10
      }

      // 如果弹窗超出屏幕顶部，调整位置
      if (top < minTop) {
        top = minTop
      }

      popupStyle.value = {
        top: `${top}px`,
        left: `${left}px`,
      }
    }

    // 监听 visible 变化，计算位置
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        nextTick(() => {
          calculatePosition()
        })
      }
    })

    // 点击外部关闭
    const handleClickOutside = (event: MouseEvent) => {
      if (!props.visible) {
        return
      }

      const target = event.target as HTMLElement
      const popup = popupRef.value

      // 如果点击的是弹窗内部或头像，不关闭
      if (popup && popup.contains(target)) {
        return
      }
      if (props.avatarElement && props.avatarElement.contains(target)) {
        return
      }

      // 点击外部，关闭弹窗
      emit('close')
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    const handleMenuClick = (menu: typeof userInfoMenuList[0]) => {
      switch (menu.key) {
        case 'profile':
          // 显示个人资料全局组件
          globalStore.setComponent('profile')
          handleClose()
          break
        case 'about':
          // 显示关于全局组件
          globalStore.setComponent('about')
          handleClose()
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = async () => {
      try {
        await MessageBox.confirm('确定要退出登录吗？', '提示')
        // 用户点击了确定
        console.log('退出登录')
        // 调用退出登录的 IPC 方法
        window.electron.auth.logout()
        handleClose()
      }
      catch {
        // 用户点击了取消，不做任何操作
      }
    }

    const handleClose = () => {
      emit('close')
    }

    return {
      CacheType,
      userInfo,
      menuList,
      popupRef,
      popupStyle,
      handleMenuClick,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.userinfo-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: all;
}

.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.popup-content {
  position: absolute;
  width: 240px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1001;
}

.popup-header {
  padding: 20px;
  background: linear-gradient(135deg, #FF7D45 0%, #FF9A6B 100%);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .avatar-section {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);

    :deep(.avatar-image) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  .user-id {
    font-size: 14px;
    opacity: 0.9;
    text-align: center;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 2px;
  }
}

.popup-menu {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F8F9FA;
  }

  &:active {
    background: #F0F0F0;
  }

  &.menu-item-danger {
    color: #FF5252;

    &:hover {
      background: #FFF5F5;
    }
  }

  .menu-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #F5F5F5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;

    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  }

  .menu-label {
    font-size: 14px;
    font-weight: 500;
    flex: 1;
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
