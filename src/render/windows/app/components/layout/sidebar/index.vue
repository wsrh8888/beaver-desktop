<template>
  <div class="nav-sidebar">
    <div ref="avatarRef" class="user-avatar-nav app__no_drag" @click="handleAvatarClick">
      <BeaverImage :file-name="userInfo.avatar" :cache-type="CacheType.USER_AVATAR" />
    </div>

    <div class="nav-icons">
      <div
        v-for="item in outsideList"
        :key="item.id"
        class="nav-item app__no_drag"
        :class="{ active: item.router === route.path }"
        @click="handleClick(item.router)"
      >
        <div class="nav-icon">
          <img :src="item.router === route.path ? item.activeIcon : item.defaultIcon" :alt="item.title">
          <span v-if="item.id === 'chat'" class="badge">3</span>
        </div>
        <div class="nav-label">
          {{ item.title }}
        </div>
      </div>
    </div>
    <!-- 更新图标 -->
    <div v-if="updateStore?.updateInfo?.hasUpdate" class="update-icon app__no_drag" @click="handleUpdateClick">
      <img src="renderModule/assets/image/update/update.svg" alt="更新">
      <span class="update-badge" />
    </div>

    <div class="main-logo">
      <img src="commonModule/assets/img/logo/logo.png" alt="Beaver Logo">
    </div>
    <!-- 用户信息弹窗 -->
    <UserInfoSidebar :visible="showUserInfo" :avatar-element="avatarRef" @close="showUserInfo = false" />
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useUpdateStore } from 'renderModule/windows/app/pinia/update/index'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { outsideList } from './data'
import UserInfoSidebar from './userInfo.vue'

export default {
  components: {
    BeaverImage,
    UserInfoSidebar,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const updateStore = useUpdateStore()

    const userInfo = computed(() => userStore.userInfo)
    const showUserInfo = ref(false)
    const avatarRef = ref<HTMLElement | null>(null)

    const handleClick = (path: string) => {
      if (path === 'update') {
        // 打开更新窗口
        updateStore.startDownload()
      }
      else {
        console.error(path)
        nextTick(() => {
          router.push({ path })
        })
      }
    }

    const handleUpdateClick = () => {
      updateStore.startUpdate()
    }

    const handleAvatarClick = () => {
      console.log('handleAvatarClick')
      showUserInfo.value = true
    }

    return {
      CacheType,
      userInfo,
      route,
      updateStore,
      handleClick,
      handleUpdateClick,
      handleAvatarClick,
      outsideList,
      showUserInfo,
      avatarRef,
    }
  },
}
</script>

<style lang="less" scoped>
.nav-sidebar {
  width: 68px;
  background: #F9FAFB;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  height: 100%;

  .main-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 40px;
      height: 40px;
      position: relative;
      z-index: 1;
    }
  }

  .nav-icons {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 16px;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
    cursor: pointer;
    width: 100%;
    position: relative;

    &.active {
      .nav-icon {
        color: #FF7D45;
        background: rgba(255,125,69,0.1);
      }

      .nav-label {
        color: #FF7D45;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 12px;
        height: 16px;
        width: 3px;
        background: #FF7D45;
        border-radius: 0 2px 2px 0;
      }
    }
  }

  .nav-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-bottom: 4px;
    position: relative;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .nav-label {
    font-size: 11px;
    color: #636E72;
  }

  .badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #FF5252;
    color: white;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    padding: 0 4px;
    box-shadow: 0 2px 4px rgba(255, 82, 82, 0.2);
  }

  .update-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #FF7D45;
    border: 2px solid #FFFFFF;
    box-shadow: 0 1px 3px rgba(255, 125, 69, 0.3);
  }

  .update-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-bottom: 36px;
    position: relative;
    transition: all 0.2s;
    background: rgba(255, 125, 69, 0.1);

    &:hover {
      background: rgba(255, 125, 69, 0.2);
    }

    img {
      width: 20px;
      height: 20px;
    }
  }

  .user-avatar-nav {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    margin-top: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
