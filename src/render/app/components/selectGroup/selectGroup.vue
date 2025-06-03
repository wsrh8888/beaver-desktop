<template>
  <Dialog v-model="visible" title="创建群聊" width="720px" @close="handleClose">
    <div class="group-creation">
      <!-- 左侧 -->
      <div class="group-creation-left">
        <div class="group-name-input">
          <label>群聊名称</label>
          <input type="text" class="input-field" v-model="groupName" placeholder="请输入群聊名称">
        </div>
        <div class="selected-friends">
          <label>已选择的好友 ({{ selectedFriends.length }})</label>
          <div class="selected-friends-list">
            <div 
              v-for="friend in selectedFriends" 
              :key="friend.userId"
              class="selected-friend"
            >
              <span>{{ friend.nickname }}</span>
              <button class="remove-friend" @click="removeFriend(friend)">
                <img src="./close.svg" alt="remove">
              </button>
            </div>
          </div>
        </div>
        <button class="create-group-button" @click="handleCreateGroup">创建群聊</button>
      </div>

      <!-- 右侧 -->
      <div class="group-creation-right">
        <div class="search-friends">
          <img class="search-icon" src="./search.svg" alt="search">
          <input type="text" class="search-input" v-model="searchText" placeholder="搜索好友">
        </div>
        <div class="friends-list">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.userId"
            class="friend-item"
            :class="{ selected: isSelected(friend) }"
            @click="toggleFriend(friend)"
          >
            <div class="friend-avatar">
              <img 
                :src="previewOnlineFileApi(friend.avatar)" 
                :alt="friend.nickname"
                @error="handleAvatarError"
              >
            </div>
            <div class="friend-name">{{ friend.nickname }}</div>
            <div class="friend-checkbox">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="cancel-button" @click="handleClose">取消</button>
      <button class="confirm-button" @click="handleCreateGroup">创建</button>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Dialog from 'renderModule/components/dialog/dialog.vue';
import { useFriendStore } from 'renderModule/app/pinia/friend/friend';
import { useGroupStore } from 'renderModule/app/pinia/group/group';
import { previewOnlineFileApi } from 'renderModule/api/file';

export default defineComponent({
  name: 'SelectGroup',
  components: {
    Dialog
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'create'],
  setup(props, { emit }) {
    const friendStore = useFriendStore();
    const groupStore = useGroupStore();
    
    const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const groupName = ref('');
    const searchText = ref('');
    const selectedFriends = ref<any[]>([]);

    const filteredFriends = computed(() => {
      return friendStore.friendList.filter(friend => 
        friend.nickname.toLowerCase().includes(searchText.value.toLowerCase())
      );
    });

    const isSelected = (friend: any) => {
      return selectedFriends.value.some(f => f.userId === friend.userId);
    };

    const toggleFriend = (friend: any) => {
      const index = selectedFriends.value.findIndex(f => f.userId === friend.userId);
      if (index === -1) {
        selectedFriends.value.push(friend);
      } else {
        selectedFriends.value.splice(index, 1);
      }
    };

    const removeFriend = (friend: any) => {
      const index = selectedFriends.value.findIndex(f => f.userId === friend.userId);
      if (index !== -1) {
        selectedFriends.value.splice(index, 1);
      }
    };

    const handleClose = () => {
      visible.value = false;
      groupName.value = '';
      searchText.value = '';
      selectedFriends.value = [];
    };

    const handleCreateGroup = async () => {
      if (!groupName.value) {
        // 显示错误提示
        return;
      }

      if (selectedFriends.value.length < 2) {
        // 显示错误提示
        return;
      }

      try {
        const memberIds = selectedFriends.value.map(f => f.userId);
        await groupStore.createGroup({
          name: groupName.value,
          memberIds
        });
        emit('create');
        handleClose();
      } catch (error) {
        console.error('Failed to create group:', error);
      }
    };

    const handleAvatarError = (e: Event) => {
      const target = e.target as HTMLImageElement;
    };

    return {
      visible,
      groupName,
      searchText,
      selectedFriends,
      filteredFriends,
      isSelected,
      toggleFriend,
      removeFriend,
      handleClose,
      handleCreateGroup,
      handleAvatarError,
      previewOnlineFileApi
    };
  }
});
</script>

<style lang="less" scoped>
.group-creation {
  display: flex;
  gap: 24px;
  height: calc(80vh - 56px - 72px);

  &-left {
    flex: 1;
    display: flex;
    flex-direction: column;

    .group-name-input {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #2D3436;
      }
    }

    // ... 其他样式与设计图一致
  }

  &-right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .search-friends {
      margin-bottom: 16px;
      position: relative;
    }

    // ... 其他样式与设计图一致
  }
}

// ... 其他样式与设计图一致
</style>