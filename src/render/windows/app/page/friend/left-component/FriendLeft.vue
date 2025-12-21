<template>
  <div class="friend-list-sidebar">
    <!-- 搜索和添加按钮区域 -->
    <div class="list-header">
      <div class="search-container">
        <input type="text" class="search-input" placeholder="搜索好友">
        <span class="search-icon">
          <img src="renderModule/assets/image/friend/search.svg" alt="搜索">
        </span>
      </div>

      <div class="add-button" tabindex="0" @click.stop="changePopupMenu(true)">
        <img src="renderModule/assets/image/friend/add.svg" alt="添加">
      </div>
      <PopupMenu
        :visible="showPopupMenu"
        :menu-items="POPUP_MENU_CONFIG"
        @item-click="handlePopupItemClick"
        @hide="changePopupMenu(false)"
      />
    </div>

    <!-- 通知入口 -->
    <div class="notification-entries">
      <div
        v-for="item in notificationList"
        :key="item.key"
        class="notification-entry"
        @click="handleNotificationClick(item.key)"
      >
        <span class="entry-name">{{ item.text }}</span>
        <span class="entry-right">
          <span v-if="badgeCount(item) > 0" class="badge">{{ badgeCount(item) }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: currentTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 列表内容区域 -->
    <div class="list-content">
      <!-- 好友列表 -->
      <div v-show="currentTab === 'friends'">
        <template v-if="friendList.length > 0">
          <div class="section-title">
            联系人
          </div>
          <div
            v-for="friend in friendList"
            :key="friend.userId"
            class="friend-item"
            :class="{ active: selectedId === friend.userId }"
            @click="handleItemClick(friend.userId)"
          >
            <div class="friend-avatar">
              <BeaverImage
                :file-name="friend.avatar"
                :alt="friend.nickName"
              />
            </div>
            <div class="friend-info">
              <div class="friend-name">
                {{ friend.nickName || '未知用户' }}
              </div>
              <div class="friend-status">
                {{ friend.notice || '暂无备注' }}
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <div class="empty-text">
            暂无好友
          </div>
        </div>
      </div>

      <!-- 群聊列表 -->
      <div v-show="currentTab === 'groups'">
        <div class="section-title">
          我的群聊
        </div>
        <div
          v-for="group in groupList"
          :key="group.conversationId"
          class="friend-item"
          :class="{ active: selectedId === group.conversationId }"
          @click="handleItemClick(group.conversationId)"
        >
          <div class="friend-avatar">
            <BeaverImage
              :file-name="group.avatar"
              :alt="group.title"
            />
          </div>
          <div class="friend-info">
            <div class="friend-name">
              {{ group.title || '未命名群聊' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useNotificationStore } from 'renderModule/windows/app/pinia/notification/notification'
import { useFriendViewStore } from 'renderModule/windows/app/pinia/view/friend'
import { computed, ref } from 'vue'
import { notificationList, POPUP_MENU_CONFIG, TABS_CONFIG } from '../data'
import PopupMenu from './PopupMenu.vue'

export default {
  components: {
    BeaverImage,
    PopupMenu,
  },
  setup() {
    const friendStore = useFriendStore()
    const groupStore = useGroupStore()
    const friendViewStore = useFriendViewStore()
    const notificationStore = useNotificationStore()

    const showPopupMenu = ref(false)

    // 当前选中的项目ID - 从 friend view store 获取
    const selectedId = computed(() => friendViewStore.selectedId || '')

    // 当前标签页 - 从 friend view store 获取
    const currentTab = computed(() => friendViewStore.currentTab)

    const tabs = TABS_CONFIG

    const handleTabChange = (tab: string) => {
      friendViewStore.setCurrentTab(tab)
    }

    const handleNotificationClick = async (value: string) => {
      // 点击通知入口：跳转到通知页面，并标记该分类为已读
      // 这符合用户习惯：点击查看通知后，红点消失
      const notificationItem = notificationList.find(item => item.key === value)
      if (notificationItem && notificationItem.badgeCategories) {
        // 标记相关分类为已读（调用后端API）
        for (const category of notificationItem.badgeCategories) {
          await notificationStore.markCategoryAsViewed(category)
        }
      }

      friendViewStore.setSelectedConversationWithType('', value as 'friend-notification' | 'group-notification')
    }
    const changePopupMenu = (visible: boolean) => {
      console.log('changePopupMenu', visible)
      showPopupMenu.value = visible
    }

    // 处理弹窗菜单项点击
    const handlePopupItemClick = async (item: any) => {
      if (item.action === 'add-friend') {
        try {
          // 打开独立的搜索窗口
          await electron.window.openWindow('search')
        }
        catch (error) {
          console.error('handlePopupItemClick error', error)
        }
      }
      else if (item.action === 'create-group') {
        // 显示创建群聊弹窗
        friendViewStore.showDialog('create-group')
      }
      changePopupMenu(false)
    }

    // 处理项目点击
    const handleItemClick = (id: string) => {
      // 根据当前tab设置类型，确保类型和ID匹配
      const type = currentTab.value === 'friends' ? 'friend' : 'group'
      friendViewStore.setSelectedConversationWithType(id, type)
    }

    const badgeCount = (item: any) => {
      if (item.badgeCategories && Array.isArray(item.badgeCategories)) {
        return item.badgeCategories.reduce((sum: number, cat: string) => sum + notificationStore.getCategoryUnread(cat), 0)
      }
      if (item.badgeCategory) {
        return notificationStore.getCategoryUnread(item.badgeCategory)
      }
      return 0
    }

    return {
      currentTab,
      tabs,
      showPopupMenu,
      friendList: computed(() => friendStore.getFriendList),
      groupList: computed(() => groupStore.getGroupList),
      handleTabChange,
      handleItemClick,
      handleNotificationClick,
      selectedId,
      notificationList,
      badgeCount,
      friendStore,
      changePopupMenu,
      friendViewStore,
      POPUP_MENU_CONFIG,
      handlePopupItemClick,
    }
  },
}
</script>

<style lang="less" scoped>
.friend-list-sidebar {
  width: 280px;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  height: 100%;
}

.list-header {
  height: 64px;
  border-bottom: 1px solid #EBEEF5;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.search-container {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  height: 36px;
  background: #F9FAFB;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 0 16px 0 36px;
  font-size: 13px;
  color: #2D3436;
  outline: none;
  transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
}

.search-input:focus {
  border-color: #FF7D45;
  box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.1);
}

.search-input::placeholder {
  color: #B2BEC3;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #B2BEC3;
  pointer-events: none;
}

.search-icon img {
  width: 16px;
  height: 16px;
}

.add-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #F9FAFB;
  border: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #636E72;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-button:hover {
  color: #FF7D45;
  border-color: #FF7D45;
  background: rgba(255, 125, 69, 0.05);
}

.add-button img {
  width: 16px;
  height: 16px;
}

.notification-entries {
  background-color: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
}

.notification-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #F5F5F5;

  &:hover {
    background-color: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
}

.entry-right {
  display: flex;
  align-items: center;
  gap: 8px;

  .badge {
    min-width: 18px;
    padding: 0 6px;
    height: 18px;
    border-radius: 9px;
    background: #FF5252;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(255, 82, 82, 0.15);
  }
}

.entry-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
}

.entry-arrow {
  color: #B2BEC3;
  transition: transform 0.2s;
  display: flex;
  align-items: center;

  .notification-entry:hover & {
    transform: translateX(2px);
    color: #FF7D45;
  }
}

.tabs {
  display: flex;
  background-color: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
}

.tab {
  flex: 1;
  padding: 14px 0;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #636E72;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &.active {
    color: #FF7D45;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #FF7D45;
    }
  }
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.section-title {
  padding: 0 16px;
  font-size: 12px;
  color: #B2BEC3;
  margin: 12px 0 4px;
  font-weight: 500;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  position: relative;
  border-radius: 8px;
  margin: 0 0px 4px;
  transition: all 0.2s;
}

.friend-item:hover {
  background: #F9FAFB;
}

.friend-item.active {
  background: rgba(255, 125, 69, 0.1);
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-status {
  font-size: 12px;
  color: #B2BEC3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #B2BEC3;
}

.empty-text {
  font-size: 14px;
}

.list-footer {
  height: 48px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.list-footer .section-title {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  margin: 0;
}
</style>
