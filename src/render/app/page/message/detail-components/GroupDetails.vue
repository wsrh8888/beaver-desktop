<template>
  <div>
    <div class="group-details-sidebar" :class="{ active: isVisible }">
      <div class="sidebar-header">
        <h3>群聊详情</h3>
        <button class="close-sidebar" @click="closeDetails">
          <img src="renderModule/assets/image/group/close.svg" alt="关闭">
        </button>
      </div>
      <div class="sidebar-content">
        <!-- 群基本信息 -->
        <div class="group-info">
          <div class="group-avatar-container">
            <div v-if="groupInfo" class="group-avatar">
              <BeaverImage
                v-if="groupInfo.avatar"
                :file-name="groupInfo.avatar"
                alt="群头像"
                image-class="group-avatar-image"
              />
              <span v-else>{{ groupInfo.title }}</span>
            </div>
            <div class="avatar-edit-icon" @click="handleEditAvatar">
              <img src="renderModule/assets/image/group/edit.svg" alt="编辑">
            </div>
          </div>
          <div class="group-name-container">
            <div class="group-name-wrapper">
              <div
                class="group-name"
                :class="{ editing: isEditingName }"
                @click="startEditName"
              >
                {{ groupInfo?.title || '群聊' }}
              </div>
              <input
                ref="nameInput"
                v-model="editedName"
                type="text"
                class="group-name-input"
                :class="{ active: isEditingName }"
                @blur="saveGroupName"
                @keyup.enter="saveGroupName"
              >
            </div>
            <div v-if="groupInfo" class="group-id">
              群ID: {{ groupInfo.conversationId }}
            </div>
          </div>
        </div>

        <!-- 群成员 -->
        <div class="group-members">
          <div class="members-header">
            <div>
              <span class="members-title">群成员</span>
              <span v-if="groupMembers" class="members-count">({{ groupMembers.length }}人)</span>
            </div>
            <button class="add-member" @click="handleAddMember">
              <img src="renderModule/assets/image/group/add.svg" alt="添加">
              添加成员
            </button>
          </div>

          <div v-if="groupMembers && groupMembers.length > 0" class="members-grid">
            <div
              v-for="member in displayedMembers"
              :key="member.userId"
              class="member-item"
            >
              <div class="member-avatar">
                <BeaverImage
                  v-if="member.avatar"
                  :file-name="member.avatar"
                  alt="成员头像"
                  image-class="member-avatar-image"
                />
              </div>
              <div class="member-name">
                {{ member.displayName || member.nickname }}
              </div>
            </div>
          </div>

          <div v-if="groupMembers && groupMembers.length > 8" class="show-more" @click="toggleShowAllMembers">
            {{ showAllMembers ? '收起成员列表' : '查看更多成员' }}
            <img
              src="renderModule/assets/image/group/expand.svg"
              alt="展开"
              :style="{ transform: showAllMembers ? 'rotate(180deg)' : 'rotate(0)' }"
            >
          </div>
        </div>

        <!-- 群设置 -->
        <div class="group-settings">
          <div class="settings-header">
            群聊设置
          </div>

          <div class="settings-item">
            <div class="setting-label">
              群聊置顶
            </div>
            <label class="switch">
              <input v-model="settings.top" type="checkbox">
              <span class="slider" />
            </label>
          </div>
        </div>

        <button class="leave-group" @click="handleLeaveGroup">
          退出群聊
        </button>
      </div>
    </div>

    <!-- 覆盖层 -->
    <div class="overlay" :class="{ active: isVisible }" @click="closeDetails" />
  </div>
</template>

<script lang="ts">
import { updateGroupInfoApi } from 'renderModule/api/group'
import { useGroupStore } from 'renderModule/app/pinia/group/group'
import { useGroupMemberStore } from 'renderModule/app/pinia/group/group-member'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
// import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'GroupDetails',
  components: {
    BeaverImage,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'close'],
  setup(props, { emit }) {
    // const conversationStore = useConversationStore()
    const groupStore = useGroupStore()
    const groupMemberStore = useGroupMemberStore()
    // const _userStore = useUserStore()
    const messageViewStore = useMessageViewStore()

    const isVisible = ref(props.visible)
    const isEditingName = ref(false)
    const editedName = ref('')
    const nameInput = ref<HTMLInputElement | null>(null)
    const showAllMembers = ref(false)

    // 监听visible属性变化
    watch(() => props.visible, (newVal) => {
      isVisible.value = newVal
      if (newVal && groupInfo.value) {
        editedName.value = groupInfo.value.title || ''
        // 如果打开详情面板，加载群成员
        loadGroupMembers()
      }
    })

    // 获取当前群组信息
    const groupInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null

      return groupStore.getGroupById(currentId)
    })

    // 群组成员列表 - 从store获取
    const groupMembers = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return []
      return groupMemberStore.getMembersByGroupId(currentId)
    })

    // 显示的成员列表（受showAllMembers控制）
    const displayedMembers = computed(() => {
      if (!groupMembers.value)
        return []
      return showAllMembers.value ? groupMembers.value : groupMembers.value.slice(0, 16)
    })

    // 群组设置
    const settings = ref({
      mute: false,
      top: false,
      favorite: false,
      showNickname: true,
    })

    // 加载群成员
    const loadGroupMembers = async () => {
      if (!groupInfo.value)
        return

      try {
        await groupMemberStore.getGroupMembersApi(groupInfo.value.conversationId, true)
      }
      catch (error) {
        console.error('Failed to load group members:', error)
      }
    }

    // 关闭详情面板
    const closeDetails = () => {
      isVisible.value = false
      emit('update:visible', false)
      emit('close')
    }

    // 开始编辑群名称
    const startEditName = () => {
      if (!groupInfo.value)
        return

      isEditingName.value = true
      editedName.value = groupInfo.value.title || ''

      nextTick(() => {
        if (nameInput.value) {
          nameInput.value.focus()
          nameInput.value.select()
        }
      })
    }

    // 保存群名称
    const saveGroupName = async () => {
      if (!groupInfo.value || !editedName.value.trim()) {
        isEditingName.value = false
        return
      }

      if (editedName.value !== groupInfo.value.title) {
        try {
          await updateGroupInfoApi({
            groupId: groupInfo.value.conversationId,
            title: editedName.value.trim(),
          })

          // 更新本地群组信息
          groupStore.updateGroupInfo(groupInfo.value.conversationId)
        }
        catch (error) {
          console.error('Failed to update group name:', error)
        }
      }

      isEditingName.value = false
    }

    // 编辑头像
    const handleEditAvatar = () => {
      // 实际项目中这里会打开文件选择对话框
      console.log('Edit avatar clicked')
    }

    // 添加成员
    const handleAddMember = () => {
      // 实际项目中这里会打开添加成员对话框
      console.log('Add member clicked')
    }

    // 切换显示所有成员
    const toggleShowAllMembers = () => {
      showAllMembers.value = !showAllMembers.value
    }

    // 退出群聊
    const handleLeaveGroup = async () => {
      if (!groupInfo.value)
        return
      console.log('退出群聊')
    }

    // 保存群设置
    watch(settings, async (newSettings) => {
      if (!groupInfo.value)
        return

      try {
        await updateGroupInfoApi({
          groupId: groupInfo.value.conversationId,
          ...newSettings,
        })
      }
      catch (error) {
        console.error('Failed to update group settings:', error)
      }
    }, { deep: true })

    onMounted(() => {
      if (isVisible.value && groupInfo.value) {
        loadGroupMembers()
      }
    })

    return {
      isVisible,
      groupInfo,
      groupMembers,
      displayedMembers,
      isEditingName,
      editedName,
      nameInput,
      settings,
      showAllMembers,
      closeDetails,
      startEditName,
      saveGroupName,
      handleEditAvatar,
      handleAddMember,
      toggleShowAllMembers,
      handleLeaveGroup,
    }
  },
})
</script>

<style lang="less" scoped>
:root {
  /* 主色系 */
  --primary: #FF7D45;
  --primary-dark: #E86835;
  --primary-light: #FFE6D9;

  /* 辅助色 */
  --auxiliary-blue: #4A6FA1;
  --light-blue: #D9E6FF;
  --accent-yellow: #FFD166;

  /* 文本色 */
  --title-text: #2D3436;
  --body-text: #636E72;
  --auxiliary-text: #B2BEC3;
  --white-text: #FFFFFF;

  /* 功能色 */
  --bg-color: #FFFFFF;
  --secondary-bg: #F9FAFB;
  --divider: #EBEEF5;
  --success: #4CAF50;
  --warning: #FFC107;
  --error: #FF5252;
  --info: #2196F3;

  /* 基础单位 */
  --base-unit: 8px;
}

/* 群详情侧边栏 */
.group-details-sidebar {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100%;
  background-color: #FFFFFF;
  border-left: 1px solid #EBEEF5;
  z-index: 100;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

.group-details-sidebar.active {
  right: 0;
}

.sidebar-header {
  height: 64px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
}

.close-sidebar {
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

.close-sidebar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.close-sidebar img {
  width: 20px;
  height: 20px;
  fill: #636E72;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(178, 190, 195, 0.5);
    border-radius: 3px;

    &:hover {
      background-color: rgba(178, 190, 195, 0.8);
    }
  }
}

/* 群基本信息 */
.group-info {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EBEEF5;
}

.group-avatar-container {
  position: relative;
  margin-right: 20px;
}

.group-avatar {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background-color: #FFE6D9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF7D45;
  font-size: 28px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-edit-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background-color: #FF7D45;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  img {
    width: 14px;
    height: 14px;
    fill: #FFFFFF;
  }
}

.group-name-container {
  flex: 1;
}

.group-name-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.group-name {
  font-size: 20px;
  font-weight: 600;
  color: #2D3436;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  margin: -4px -8px;
  transition: background-color 0.2s;
}

.group-name:hover {
  background-color: #F9FAFB;
}

.group-name-input {
  font-size: 20px;
  font-weight: 600;
  color: #2D3436;
  background: transparent;
  border: none;
  border-bottom: 2px solid #FF7D45;
  padding: 4px 0;
  margin: 0;
  width: 100%;
  outline: none;
  display: none;
}

.group-name-input.active {
  display: block;
}

.group-name.editing {
  display: none;
}

.group-id {
  font-size: 13px;
  color: #B2BEC3;
  margin-top: 4px;
}

/* 群成员 */
.group-members {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EBEEF5;
}

.members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.members-title {
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
}

.members-count {
  color: #B2BEC3;
  margin-left: 6px;
  font-weight: normal;
}

.add-member {
  height: 32px;
  border-radius: 16px;
  border: none;
  background-color: #F9FAFB;
  padding: 0 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #636E72;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  img {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    fill: #636E72;
  }
}

.add-member:hover {
  background-color: #EBEEF5;
}

.members-grid {
  display: flex;
  flex-wrap: wrap;
  // gap: px;
  width: 100%;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  flex-shrink: 0;
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #D9E6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A6FA1;
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.member-item:hover .member-avatar {
  transform: translateY(-1px);
}

.member-name {
  font-size: 12px;
  color: #636E72;
  text-align: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
  box-sizing: border-box;
}

.show-more {
  width: 100%;
  text-align: center;
  margin-top: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #4A6FA1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border-radius: 6px;
  transition: background-color 0.2s;

  img {
    width: 16px;
    height: 16px;
    fill: #4A6FA1;
    margin-left: 6px;
  }
}

.show-more:hover {
  background-color: #F9FAFB;
}

/* 群设置 */
.group-settings {
  margin-bottom: 32px;
}

.settings-header {
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 16px;
}

.settings-item {
  padding: 16px 0;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #636E72;
  flex: 1;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #EBEEF5;
  transition: .3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input:checked + .slider {
  background-color: #FF7D45;
}

input:focus + .slider {
  box-shadow: 0 0 1px #FF7D45;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* 退出群聊 */
.leave-group {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background-color: #FFE6D9;
  color: #E86835;
  border: 1px solid #E86835;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.2s;
}

.leave-group:hover {
  background-color: #E86835;
  color: #FFFFFF;
}

/* 覆盖层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.overlay.active {
  opacity: 1;
  pointer-events: auto;
}
</style>
