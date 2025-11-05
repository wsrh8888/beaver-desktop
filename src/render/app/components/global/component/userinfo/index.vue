<template>
  <div class="userinfo-panel">
    <!-- 头部信息区 -->
    <div class="panel-header">
      <div class="user-info">
        <div class="avatar">
          <BeaverImage
            :file-name="userInfo.avatar"
            :cache-type="CacheType.USER_AVATAR"
            alt="头像"
            image-class="avatar-image"
          />
        </div>
        <div class="user-details">
          <div class="nickname">
            {{ userInfo.nickName || '用户' }}
          </div>
          <div class="userid">
            ID: {{ userInfo.userId }}
          </div>
        </div>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 菜单列表区 -->
    <div class="panel-menu">
      <div
        v-for="menu in menuList"
        :key="menu.key"
        class="menu-item"
        @click="handleMenuClick(menu)"
      >
        <div class="menu-icon">
          <img :src="menu.icon" :alt="menu.label">
        </div>
        <div class="menu-content">
          <div class="menu-label">
            {{ menu.label }}
          </div>
          <div class="menu-desc">
            {{ menu.desc }}
          </div>
        </div>
        <div class="menu-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { useUserStore } from 'renderModule/app/pinia/user/user'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent } from 'vue'
import { useGlobalStore } from '../../../../pinia/view/global/index'

// 菜单项配置
const MENU_ITEMS = [
  {
    key: 'settings',
    label: '设置',
    desc: '个人资料、隐私设置',
    icon: 'renderModule/assets/image/friend/edit.svg',
  },
  {
    key: 'about',
    label: '关于海狸',
    desc: '版本信息、帮助反馈',
    icon: 'renderModule/assets/image/friend/user-plus.svg',
  },
  {
    key: 'logout',
    label: '退出登录',
    desc: '安全退出账号',
    icon: 'renderModule/assets/image/friend/phone.svg',
  },
]

export default defineComponent({
  name: 'UserInfoComponent',
  components: {
    BeaverImage,
  },
  emits: ['close'],
  setup() {
    const userStore = useUserStore()
    const globalStore = useGlobalStore()

    const userInfo = computed(() => userStore.userInfo)

    const menuList = MENU_ITEMS

    const handleMenuClick = (menu: typeof MENU_ITEMS[0]) => {
      switch (menu.key) {
        case 'settings':
          // 切换到设置组件
          globalStore.setComponent('settings')
          break
        case 'about':
          // 这里可以直接显示关于信息，或者切换到关于组件
          globalStore.setComponent('update') // 暂时用update代替
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = () => {
      // TODO: 实现退出登录逻辑
      // if (confirm('确定要退出登录吗？')) {
      //   console.log('退出登录')
      //   emit('close')
      // }
      console.log('退出登录')
    }

    return {
      CacheType,
      userInfo,
      menuList,
      handleMenuClick,
    }
  },
})
</script>

<style lang="less" scoped>
.userinfo-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 500px;
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .user-details {
      .nickname {
        font-size: 16px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 4px;
      }

      .userid {
        font-size: 12px;
        color: #B2BEC3;
      }
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background: #F5F5F5;
    }

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
  }
}

/* 菜单列表 */
.panel-menu {
  flex: 1;
  overflow-y: auto;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #F8F9FA;

    &:hover {
      background: #F8F9FA;
    }

    &:last-child {
      border-bottom: none;
      color: #FF5252; /* 退出登录用红色 */

      &:hover {
        background: #FFF5F5;
      }
    }

    .menu-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #F5F5F5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .menu-content {
      flex: 1;

      .menu-label {
        font-size: 14px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 2px;
      }

      .menu-desc {
        font-size: 12px;
        color: #B2BEC3;
      }
    }

    .menu-arrow {
      width: 16px;
      height: 16px;
      color: #B2BEC3;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }
  }
}
</style>
