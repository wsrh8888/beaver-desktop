<template>
  <div class="contacts-column">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-wrapper">
        <input type="text" class="search-input" placeholder="搜索" v-model="searchText" @input="handleSearch">
        <img class="search-icon" src="renderModule/assets/image/friend/search.svg" alt="search">
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
    
    <!-- 功能入口 -->
    <!-- <div class="actions">
      <div class="action-row" @click="handleNewFriends">
        <div class="action-text">新朋友<span class="badge" v-if="hasNewFriends"></span></div>
      </div>
      <div class="action-row" @click="handleAddFriend">
        <div class="action-text">添加好友</div>
      </div>
    </div> -->
    
    <!-- 列表区域 -->
    <div class="list-area">
      <!-- 好友列表 -->
      <div class="list-container" v-show="currentTab === 'friends'">
        <!-- 我的设备 -->
        <!-- <div class="section-title">我的设备</div>
        <div class="device-item">
          <div class="device-avatar">
          </div>
          <div class="device-info">
            <div class="device-name">我的手机</div>
            <div class="device-status">iPhone 15</div>
          </div>
        </div>
        
        <div class="divider"></div>
         -->
        <!-- AI助手 -->
        <!-- <div class="section-title">AI助手</div>
        <div 
          v-for="ai in aiAssistants" 
          :key="ai.id"
          class="ai-item"
          @click="handleAiClick(ai)"
        >
          <div class="ai-avatar">
            <img :src="ai.avatar" :alt="ai.name">
          </div>
          <div class="ai-info">
            <div class="ai-name">{{ ai.name }}</div>
            <div class="ai-description">{{ ai.description }}</div>
          </div>
        </div> -->
        
        <!-- <div class="divider"></div> -->
        
        <!-- 好友列表 -->
        <template v-if="friendList.length > 0">
          <div class="section-title">联系人</div>
          <div 
            v-for="friend in friendList" 
            :key="friend.userId"
            class="friend-item"
            :class="{ active: selectedFriendId === friend.userId }"
            @click="handleFriendClick(friend)"
          >
            <div class="friend-avatar">
              <img 
                :src="friend.avatar" 
                :alt="friend.nickname"
              >
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ friend.nickname || '未知用户' }}</div>
              <div class="friend-message">{{ friend.remarkName }}</div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- 群聊列表 -->
      <div class="list-container" v-show="currentTab === 'groups'">
        <div class="section-title">我的群聊</div>
        <div 
          v-for="group in groupList" 
          :key="group.conversationId"
          class="group-item"
          :class="{ active: selectedGroupId === group.conversationId }"
          @click="handleGroupClick(group)"
        >
          <div class="group-avatar">
            <img 
              :src="group.avatar" 
              :alt="group.name"
            >
          </div>
          <div class="group-info">
            <div class="group-name">{{ group.name || '未命名群聊' }}</div>
            <div class="group-count">{{ group.memberCount }}人</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useFriendStore } from 'renderModule/app/pinia/friend/friend';
import { useGroupStore } from 'renderModule/app/pinia/group/group';

export default defineComponent({
  setup() {
    const friendStore = useFriendStore();
    const groupStore = useGroupStore();
    
    const searchText = ref('');
    const currentTab = ref('friends');
    const selectedFriendId = ref('');
    const selectedGroupId = ref('');
    const hasNewFriends = ref(true);

    const tabs = [
      { key: 'friends', name: '好友' },
      { key: 'groups', name: '群聊' }
    ];


    onMounted(async () => {
      await friendStore.initFriendApi();
      await groupStore.initGroupListApi();
    });

    const handleTabChange = (tab: string) => {
      currentTab.value = tab;
    };

    const handleSearch = () => {
      // 实现搜索逻辑
    };

    const handleNewFriends = () => {
      // 处理新朋友点击
    };

    const handleAddFriend = () => {
      // 处理添加好友点击
    };

    const handleFriendClick = (friend: any) => {
      selectedFriendId.value = friend.userId;
      // 处理好友点击
    };

    const handleGroupClick = (group: any) => {
      selectedGroupId.value = group.conversationId;
      // 处理群组点击
    };

    const handleAiClick = (ai: any) => {
      // 处理AI助手点击
    };

  


    return {
      searchText,
      currentTab,
      tabs,
      hasNewFriends,
      selectedFriendId,
      selectedGroupId,
      friendList: computed(() => friendStore.friendList) ,
      groupList: computed(() => groupStore.groupList),
      handleTabChange,
      handleSearch,
      handleNewFriends,
      handleAddFriend,
      handleFriendClick,
      handleGroupClick,
      handleAiClick,
      friendStore,
    };
  }
});
</script>

<style lang="less" scoped>
.contacts-column {
  width: 280px;
  background-color: #FFFFFF;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
}

.search-container {
  padding: 16px 16px 12px;
  border-bottom: 1px solid #EBEEF5;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  border: none;
  background-color: #F9FAFB;
  padding: 0 16px 0 36px;
  font-size: 13px;
  color: #2D3436;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background-color: #F9FAFB;
    box-shadow: 0 0 0 1px #FF7D45;
  }

  &::placeholder {
    color: #B2BEC3;
  }
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #B2BEC3;
  pointer-events: none;
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

.actions {
  border-bottom: 1px solid #EBEEF5;
}

.action-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
}

.badge {
  position: relative;
  top: -1px;
  margin-left: 6px;
  width: 6px;
  height: 6px;
  background-color: #FF5252;
  background-color: #FF5252;
  border-radius: 50%;
  display: inline-block;
}

.list-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.section-title {
  padding: 0 16px;
  font-size: 12px;
  color: #B2BEC3;
  margin: 12px 0 4px;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: #EBEEF5;
  margin: 8px 0;
}

.device-item,
.ai-item,
.friend-item,
.group-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }

  &.active {
    background-color: #FFE6D9;
  }
}

.device-avatar,
.ai-avatar,
.friend-avatar,
.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.device-info,
.ai-info,
.friend-info,
.group-info {
  flex: 1;
}

.device-name,
.ai-name,
.friend-name,
.group-name {
  font-size: 14px;
  color: #2D3436;
  font-weight: 500;
}

.device-status,
.ai-description,
.friend-message,
.group-count {
  font-size: 12px;
  color: #B2BEC3;
}
</style>