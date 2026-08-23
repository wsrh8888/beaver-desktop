<template>
  <div class="nav-sidebar">
    <div class="main-logo">
      <img src="commonModule/assets/img/logo/logo.png" alt="Beaver Logo">
    </div>

    <div class="nav-icons">
      <div
        v-for="item in coreNavList"
        :key="item.id"
        class="nav-item app__no_drag"
        :class="{ active: isActive(item) }"
        :title="item.title"
        @click="handleClick(item)"
      >
        <div class="nav-icon">
          <img :src="isActive(item) ? item.activeIcon : item.defaultIcon" :alt="item.title">
          <span
            v-if="item.id === 'message' && totalUnreadCount > 0"
            class="badge"
          >
            {{ totalUnreadCount }}
          </span>
          <span
            v-else-if="badgeCount(item) > 0"
            class="badge"
          >
            {{ badgeCount(item) }}
          </span>
        </div>
        <div class="nav-label">
          {{ item.title }}
        </div>
      </div>

      <div class="nav-divider" />

      <div
        v-for="item in appNavList"
        :key="item.id"
        class="nav-item app__no_drag"
        :class="{ active: isActive(item) }"
        :title="item.title"
        @click="handleClick(item)"
      >
        <div class="nav-icon">
          <img :src="isActive(item) ? item.activeIcon : item.defaultIcon" :alt="item.title">
          <span v-if="badgeCount(item) > 0" class="badge">
            {{ badgeCount(item) }}
          </span>
        </div>
        <div class="nav-label">
          {{ item.title }}
        </div>
      </div>
    </div>

    <div class="nav-bottom">
      <div
        v-if="updateStore?.updateInfo?.hasUpdate"
        class="update-icon app__no_drag"
        title="有可用更新"
        @click="handleUpdateClick"
      >
        <img src="renderModule/assets/image/update/update.svg" alt="更新">
        <span class="update-badge" />
      </div>

      <div ref="avatarRef" class="user-avatar-nav app__no_drag" title="个人中心" @click="handleAvatarClick">
        <BeaverImage :file-name="userInfo.avatar" :cache-type="CacheType.USER_AVATAR" />
      </div>

      <div class="about-entry app__no_drag" title="开源致谢" @click="handleAboutClick">
        <div class="about-entry__icon">
          <img src="renderModule/assets/image/leftBar/settings/about.svg" alt="开源致谢">
        </div>
        <div class="about-entry__label">
          开源致谢
        </div>
      </div>
    </div>

    <UserInfoSidebar :visible="showUserInfo" :avatar-element="avatarRef" @close="showUserInfo = false" />
  </div>
</template>

<script lang="ts">
import type { ISidebarNavItem } from './data'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useNotificationStore } from 'renderModule/windows/app/pinia/notification/notification'
import { useUpdateStore } from 'renderModule/windows/app/pinia/update/index'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appNavList, coreNavList } from './data'
import UserInfoSidebar from './userInfo.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'

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
    const notificationStore = useNotificationStore()
    const conversationStore = useConversationStore()

    const totalUnreadCount = computed(() => conversationStore.getTotalUnreadCount)
    const userInfo = computed(() => userStore.getUserInfo)
    const showUserInfo = ref(false)
    const avatarRef = ref<HTMLElement | null>(null)

    const isActive = (item: ISidebarNavItem) => {
      return !!item.router && item.router === route.path
    }

    const badgeCount = (item: ISidebarNavItem) => {
      if (item.badgeCategories?.length) {
        return item.badgeCategories.reduce(
          (sum, cat) => sum + notificationStore.getCategoryUnread(cat),
          0,
        )
      }
      if (item.badgeCategory)
        return notificationStore.getCategoryUnread(item.badgeCategory)
      return 0
    }

    const handleClick = (item: ISidebarNavItem) => {
      if (item.id === 'moment') {
        electron.window.openWindow('moment', { unique: true })
        return
      }
      if (item.id === 'ai') {
        electron.window.openWindow('ai', { unique: true })
        return
      }
      if (item.id === 'circle') {
        electron.window.openWindow('circle', { unique: true })
        return
      }
      if (item.id === 'workbench') {
        electron.window.openWindow('workbench', { unique: true })
        return
      }
      if (item.router) {
        const path = item.router
        nextTick(() => {
          router.push({ path })
        })
      }
    }

    const handleUpdateClick = () => {
      updateStore.startUpdate()
    }

    const handleAboutClick = () => {
      void electron.window.openWindow('about', { unique: true })
    }

    const handleAvatarClick = () => {
      showUserInfo.value = true
    }

    return {
      coreNavList,
      appNavList,
      totalUnreadCount,
      CacheType,
      userInfo,
      route,
      updateStore,
      isActive,
      badgeCount,
      handleClick,
      handleUpdateClick,
      handleAboutClick,
      handleAvatarClick,
      showUserInfo,
      avatarRef,
    }
  },
}
</script>

<style lang="less" scoped>
.nav-sidebar {
  width: 56px;
  background: #F9FAFB;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  height: 100%;
}

.main-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
  }
}

.nav-icons {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}

.nav-divider {
  width: 24px;
  height: 1px;
  margin: 4px 0 8px;
  background: #EBEEF5;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  width: 100%;
  position: relative;
  flex-shrink: 0;

  &.active {
    .nav-icon {
      background: rgba(255, 125, 69, 0.1);
    }

    .nav-label {
      color: #FF7D45;
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      height: 14px;
      width: 3px;
      background: #FF7D45;
      border-radius: 0 2px 2px 0;
    }
  }
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-bottom: 2px;
  position: relative;

  img {
    width: 18px;
    height: 18px;
  }
}

.nav-label {
  font-size: 10px;
  line-height: 1.2;
  color: #636E72;
  max-width: 52px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  background: #FF5252;
  color: #FFFFFF;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  padding: 0 3px;
  box-shadow: 0 1px 3px rgba(255, 82, 82, 0.25);
}

.nav-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 8px;
}

.update-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background: rgba(255, 125, 69, 0.1);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 125, 69, 0.2);
  }

  img {
    width: 18px;
    height: 18px;
  }
}

.update-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #FF7D45;
  border: 1.5px solid #FFFFFF;
}

.about-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
  margin-top: 4px;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
    transition: background 0.2s;

    img {
      width: 18px;
      height: 18px;
    }
  }

  &__label {
    font-size: 10px;
    line-height: 1.2;
    color: #636E72;
  }

  &:hover {
    .about-entry__icon {
      background: rgba(255, 125, 69, 0.1);
    }

    .about-entry__label {
      color: #FF7D45;
    }
  }
}

.user-avatar-nav {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
