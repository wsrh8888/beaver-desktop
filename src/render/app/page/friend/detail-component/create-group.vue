<template>
  <div class="create-group-modal" @click="handleClose">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h3>创建群聊</h3>
        <button class="close-button" @click="handleClose">
          <img src="renderModule/assets/image/common/close.svg" alt="关闭">
        </button>
      </div>

      <!-- 模态框主体 -->
      <div class="modal-body">
        <!-- 左侧创建区域 -->
        <div class="group-creation-left">
          <!-- 群聊名称输入 -->
          <div class="group-name-input">
            <label>群聊名称</label>
            <input
              v-model="groupName"
              type="text"
              class="input-field"
              placeholder="请输入群聊名称"
            >
          </div>

          <!-- 已选择的好友 -->
          <div class="selected-friends">
            <label>已选择的好友 (<span>{{ selectedFriends.length }}</span>)</label>
            <div class="selected-friends-list">
              <div
                v-for="friend in selectedFriends"
                :key="friend.userId"
                class="selected-friend"
              >
                <span>{{ friend.nickname }}</span>
                <button class="remove-friend" @click="removeFriend(friend.userId)">
                  <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
                </button>
              </div>
            </div>
          </div>

          <!-- 创建按钮 -->
          <button class="create-group-button" @click="createGroup">
            创建群聊
          </button>
        </div>

        <!-- 右侧好友选择区域 -->
        <div class="group-creation-right">
          <!-- 搜索好友 -->
          <div class="search-friends">
            <img class="search-icon" src="renderModule/assets/image/create-group/search.svg" alt="搜索">
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="搜索好友"
            >
          </div>

          <!-- 好友列表 -->
          <div class="friends-list">
            <div
              v-for="friend in filteredFriends"
              :key="friend.userId"
              class="friend-item"
              :class="{ selected: isSelected(friend.userId) }"
              @click="toggleFriendSelection(friend)"
            >
              <div class="friend-avatar">
                <BeaverImage
                  :file-name="friend.avatar"
                  :alt="friend.avatar"
                />
              </div>
              <div class="friend-name">
                {{ friend.nickname }}
              </div>
              <div class="friend-checkbox">
                <img v-if="isSelected(friend.userId)" src="renderModule/assets/image/create-group/check.svg" alt="选中">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IFriendInfo } from 'commonModule/type/ajax/friend'
import { createGroupApi } from 'renderModule/api/group'
import { useFriendStore } from 'renderModule/app/pinia/friend/friend'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreateGroup',
  components: {
    BeaverImage: () => import('renderModule/components/ui/image/index.vue'),
  },
  emits: ['close', 'created'],
  data() {
    return {
      groupName: '',
      searchKeyword: '',
      selectedFriends: [] as IFriendInfo[],
      friendStore: useFriendStore(),
    }
  },
  computed: {
    filteredFriends(): IFriendInfo[] {
      if (!this.searchKeyword.trim()) {
        return this.friendStore.friendList
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.friendStore.friendList.filter((friend: IFriendInfo) =>
        friend.nickname.toLowerCase().includes(keyword),
      )
    },
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      // 初始化数据
      this.groupName = ''
      this.searchKeyword = ''
      this.selectedFriends = []
      // 确保好友数据已加载
      if (this.friendStore.friendList.length === 0) {
        this.friendStore.init()
      }
    },

    handleClose() {
      this.$emit('close')
    },

    isSelected(userId: string): boolean {
      return this.selectedFriends.some(friend => friend.userId === userId)
    },

    toggleFriendSelection(friend: IFriendInfo) {
      const index = this.selectedFriends.findIndex(f => f.userId === friend.userId)
      if (index > -1) {
        this.selectedFriends.splice(index, 1)
      }
      else {
        this.selectedFriends.push(friend)
      }
    },

    removeFriend(userId: string) {
      const index = this.selectedFriends.findIndex(friend => friend.userId === userId)
      if (index > -1) {
        this.selectedFriends.splice(index, 1)
      }
    },

    async createGroup() {
      if (!this.groupName.trim()) {
        return
      }

      if (this.selectedFriends.length < 2) {
        return
      }

      try {
        const userIdList = this.selectedFriends.map(friend => friend.userId)
        const res = await createGroupApi({
          name: this.groupName.trim(),
          userIdList,
        })

        if (res.code === 0) {
          this.$emit('created', res.result)
          this.handleClose()
        }
        else {
          console.error('创建群聊失败:', res.msg)
        }
      }
      catch (error) {
        console.error('创建群聊失败:', error)
      }
    },
  },
})
</script>

<style lang="less" scoped>
/* 模态框背景 */
.create-group-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

/* 模态框内容 */
.modal-content {
  width: 720px;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

/* 模态框头部 */
.modal-header {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EBEEF5;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
  margin: 0;
}

/* 关闭按钮 */
.close-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.close-button svg {
  width: 20px;
  height: 20px;
  fill: #636E72;
}

/* 模态框主体 */
.modal-body {
  display: flex;
  padding: 24px;
  height: calc(80vh - 56px - 72px);
  gap: 24px;
}

/* 左侧创建区域 */
.group-creation-left {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 群聊名称输入 */
.group-name-input {
  margin-bottom: 16px;
}

.group-name-input label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
}

.input-field {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #EBEEF5;
  padding: 0 12px;
  font-size: 13px;
  color: #2D3436;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #FF7D45;
  box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.2);
}

/* 已选择的好友 */
.selected-friends {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.selected-friends label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
}

.selected-friends-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  padding: 8px;
  min-height: 120px;
}

.selected-friend {
  display: inline-flex;
  align-items: center;
  background-color: #F9FAFB;
  border-radius: 16px;
  padding: 4px 12px;
  margin: 4px;
}

.selected-friend span {
  margin-right: 8px;
  font-size: 12px;
  color: #636E72;
}

.remove-friend {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #B2BEC3;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s;
}

.remove-friend:hover {
  background-color: #FF5252;
}

.remove-friend svg {
  width: 10px;
  height: 10px;
  fill: #FFFFFF;
}

/* 创建按钮 */
.create-group-button {
  width: 100%;
  height: 36px;
  background-color: #FF7D45;
  border: none;
  border-radius: 6px;
  color: #FFFFFF;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-group-button:hover {
  background-color: #E86835;
}

/* 右侧好友选择区域 */
.group-creation-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 搜索好友 */
.search-friends {
  margin-bottom: 16px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #B2BEC3;
}

.search-input {
  width: 100%;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #EBEEF5;
  padding: 0 12px 0 36px;
  font-size: 13px;
  color: #2D3436;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #FF7D45;
  box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.2);
}

/* 好友列表 */
.friends-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-item:hover {
  background-color: #F9FAFB;
}

.friend-item.selected {
  background-color: #FFE6D9;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  background-color: #D9E6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A6FA1;
  font-weight: 500;
  font-size: 16px;
  flex-shrink: 0;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-name {
  flex: 1;
  font-size: 14px;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  flex-shrink: 0;
  transition: all 0.2s;
}

.friend-item.selected .friend-checkbox {
  background-color: #FF7D45;
  border-color: #FF7D45;
}

.friend-checkbox svg {
  width: 12px;
  height: 12px;
  fill: #FFFFFF;
  display: none;
}

.friend-item.selected .friend-checkbox svg {
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 90%;
    margin: 0 16px;
  }

  .modal-body {
    flex-direction: column;
    height: auto;
    gap: 16px;
  }

  .group-creation-left,
  .group-creation-right {
    flex: none;
  }

  .friends-list {
    max-height: 300px;
  }
}
</style>
