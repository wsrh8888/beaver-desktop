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
            <div v-if="groupInfo" class="group-avatar" @click="handleAvatarClick">
              <BeaverImage
                v-if="groupInfo.avatar"
                :file-name="groupInfo.avatar"
                alt="群头像"
                image-class="group-avatar-image"
              />
              <span v-else>{{ groupInfo.title }}</span>
              <div class="avatar-edit-icon">
                <img src="renderModule/assets/image/group/edit.svg" alt="编辑">
              </div>
            </div>
            <input ref="avatarInputRef" type="file" accept="image/*" style="display: none" @change="handleAvatarChange">
          </div>
          <div class="group-name-container">
            <div class="group-name">
              {{ groupInfo ? groupInfo.title : '群聊' }}
            </div>
            <div v-if="groupInfo" class="group-id">
              群ID: {{ groupInfo.groupId }}
            </div>
          </div>
        </div>

        <!-- 群成员 -->
        <div class="group-members">
          <div class="members-header">
            <div>
              <span class="members-title">群成员</span>
              <span v-if="groupInfo" class="members-count">({{ groupMembers.length }}人)</span>
            </div>
            <button
              v-if="canManageMembers"
              class="add-member"
              @click="handleAddMember"
            >
              <img src="renderModule/assets/image/group/add.svg" alt="添加">
              添加成员
            </button>
          </div>

          <div v-if="groupMembers && groupMembers.length > 0" class="members-grid">
            <div
              v-for="member in displayedMembers"
              :key="member.userId"
              class="member-item"
              @contextmenu.prevent="handleMemberContextMenu($event, member)"
            >
              <div class="member-avatar">
                <BeaverImage
                  v-if="member.avatar"
                  :file-name="member.avatar"
                  alt="成员头像"
                  image-class="member-avatar-image"
                />
                <button
                  v-if="canManageMembers && currentUserId !== member.userId"
                  class="member-remove-btn"
                  @click.stop="handleRemoveMember(member.userId)"
                >
                  <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
                </button>
              </div>
              <div class="member-name">
                {{ member.nickName || member.userId }}
              </div>
            </div>
          </div>

          <div v-if="groupMembers && groupMembers.length > 16" class="show-more" @click="toggleShowAllMembers">
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
              置顶
            </div>
            <label class="switch">
              <input v-model="topEnabled" type="checkbox" @change="handleSettingsChange('top')">
              <span class="slider" />
            </label>
          </div>

          <div class="settings-item">
            <div class="setting-label">
              消息免打扰
            </div>
            <label class="switch">
              <input v-model="muteEnabled" type="checkbox" @change="handleSettingsChange('mute')">
              <span class="slider" />
            </label>
          </div>
        </div>

        <!-- 群主显示解散群聊按钮 -->
        <BeaverButton
          v-if="currentUserRole === 1"
          type="danger"
          size="large"
          class="leave-group-btn"
          @click="handleDisbandGroup"
        >
          解散群聊
        </BeaverButton>

        <!-- 普通成员显示退出群聊按钮 -->
        <BeaverButton
          v-if="currentUserRole !== 1"
          type="default"
          size="large"
          class="leave-group-btn"
          @click="handleLeaveGroup"
        >
          退出群聊
        </BeaverButton>
      </div>
    </div>

    <!-- 覆盖层 -->
    <div class="overlay" :class="{ active: isVisible }" @click="closeDetails" />

    <!-- 添加群成员弹窗 -->
    <AddGroupMember
      v-if="showAddMemberModal"
      :group-member-ids="groupMembers.map(m => m.userId)"
      @close="showAddMemberModal = false"
      @confirm="handleAddMemberConfirm"
    />
  </div>
</template>

<script lang="ts">
import { muteChatApi, pinnedChatApi } from 'renderModule/api/chat'
import { addGroupMemberApi, deleteGroupApi, quitGroupApi, removeGroupMemberApi, updateGroupInfoApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import MessageBox from 'renderModule/components/ui/messagebox'
import { uploadFile } from 'renderModule/utils/upload'
import AddGroupMember from 'renderModule/windows/app/components/ui/add-group-member/index.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useGroupMemberStore } from 'renderModule/windows/app/pinia/group/group-member'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'GroupDetails',
  components: {
    BeaverImage,
    BeaverButton,
    AddGroupMember,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'close'],
  setup(props, { emit }) {
    const groupStore = useGroupStore()
    const groupMemberStore = useGroupMemberStore()
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()
    const userStore = useUserStore()

    const isVisible = ref(props.visible)
    const showAllMembers = ref(false)
    const showAddMemberModal = ref(false)
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const currentUserId = computed(() => userStore.getUserId)

    // 获取当前用户在群中的角色
    const currentUserRole = computed(() => {
      if (!groupId.value || !currentUserId.value)
        return 0
      const member = groupMembers.value.find(m => m.userId === currentUserId.value)
      return member?.role || 0
    })

    // 判断是否可以管理成员（群主或管理员）
    // role: 1=群主, 2=管理员, 3=普通成员
    const canManageMembers = computed(() => {
      return currentUserRole.value === 1 || currentUserRole.value === 2
    })

    // 聊天设置状态 - 从conversation store获取当前会话的设置
    const topEnabled = ref(false)
    const muteEnabled = ref(false)

    // 从conversation store获取当前会话的信息
    const currentConversationInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null

      // 使用现成的getConversationInfo getter
      return conversationStore.getConversationInfo(currentId)
    })

    // 监听会话信息变化，初始化设置状态
    watch(currentConversationInfo, (info) => {
      if (info) {
        topEnabled.value = info.isTop || false
        muteEnabled.value = info.isMuted || false
      }
      else {
        topEnabled.value = false
        muteEnabled.value = false
      }
    }, { immediate: true })

    // 监听visible属性变化
    watch(() => props.visible, (newVal) => {
      isVisible.value = newVal
    })

    // 获取当前群组信息
    const groupInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null

      return groupStore.getGroupById(currentId)
    })

    // 从 conversationId 提取 groupId
    const groupId = computed(() => {
      if (!groupInfo.value)
        return ''
      const conversationId = groupInfo.value.conversationId
      return conversationId.startsWith('group_')
        ? conversationId.split('_').slice(1).join('_')
        : conversationId
    })

    // 群组成员列表 - 从store获取
    const groupMembers = computed(() => {
      if (!groupId.value)
        return []
      return groupMemberStore.getMembersByGroupId(groupId.value)
    })

    // 显示的成员列表（受showAllMembers控制）
    const displayedMembers = computed(() => {
      if (!groupMembers.value)
        return []
      return showAllMembers.value ? groupMembers.value : groupMembers.value.slice(0, 16)
    })

    // 处理设置变更
    const handleSettingsChange = async (setting: string) => {
      if (setting === 'mute') {
        await muteChatApi({
          conversationId: messageViewStore.currentChatId!,
          isMuted: muteEnabled.value,
        })
      }
      else if (setting === 'top') {
        await pinnedChatApi({
          conversationId: messageViewStore.currentChatId!,
          isPinned: topEnabled.value,
        })
      }
    }

    // 关闭详情面板
    const closeDetails = () => {
      isVisible.value = false
      emit('update:visible', false)
      emit('close')
    }

    // 切换显示所有成员
    const toggleShowAllMembers = () => {
      showAllMembers.value = !showAllMembers.value
    }

    // 点击头像
    const handleAvatarClick = () => {
      avatarInputRef.value?.click()
    }

    // 头像文件变化
    const handleAvatarChange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file)
        return

      try {
        // 上传头像文件
        const uploadResult = await uploadFile(file)
        if (uploadResult && uploadResult.fileKey) {
          // 更新群组信息
          await updateGroupInfoApi({
            groupId: groupId.value,
            avatar: uploadResult.fileKey,
          })
          // 更新本地群组信息
          await groupStore.updateGroupInfo(groupInfo.value!.conversationId)
          Message.success('头像上传成功')
        }
        else {
          Message.error('头像上传失败，请重试')
        }
      }
      catch (error) {
        console.error('头像上传失败:', error)
        Message.error('头像上传失败，请重试')
      }
      finally {
        // 清空 input，以便可以重复选择同一文件
        if (avatarInputRef.value) {
          avatarInputRef.value.value = ''
        }
      }
    }

    // 添加成员
    const handleAddMember = () => {
      if (!canManageMembers.value) {
        Message.warning('只有群主和管理员可以添加成员')
        return
      }
      showAddMemberModal.value = true
    }

    // 确认添加成员
    const handleAddMemberConfirm = async (userIds: string[]) => {
      if (!groupId.value || userIds.length === 0)
        return

      const result = await addGroupMemberApi({
        groupId: groupId.value,
        userIds,
      })
      if (result.code === 0) {
        Message.success('添加成员成功')
        // 重新加载群成员列表
        await groupMemberStore.init(groupId.value)
      }
      else {
        Message.error(result.msg)
      }
    }

    // 成员右键菜单
    const handleMemberContextMenu = (_event: MouseEvent, member: any) => {
      // 如果是群主或管理员，可以删除成员
      if (canManageMembers.value && currentUserId.value !== member.userId) {
        // 显示删除确认
        MessageBox.confirm(`确定要移除成员 ${member.nickName || member.userId} 吗？`, '确认操作')
          .then(() => {
            handleRemoveMember(member.userId)
          })
          .catch(() => {
            // 用户取消操作
          })
      }
    }

    // 移除成员
    const handleRemoveMember = async (memberId: string) => {
      if (!groupId.value)
        return

      try {
        await removeGroupMemberApi({
          groupId: groupId.value,
          userIds: [memberId],
        })
        // 从本地移除
        groupMemberStore.removeMembers(groupId.value, [memberId])
        Message.success('移除成员成功')
      }
      catch (error) {
        console.error('移除成员失败:', error)
        Message.error('移除成员失败，请重试')
      }
    }

    // 退出群聊
    const handleLeaveGroup = async () => {
      if (!groupId.value)
        return

      await MessageBox.confirm('确定要退出该群聊吗？', '确认操作')

      try {
        await quitGroupApi({
          groupId: groupId.value,
        })
        Message.success('已退出群聊')
        // 关闭详情面板
        closeDetails()
        // TODO: 可能需要更新会话列表，移除该群聊
      }
      catch (error) {
        console.error('退出群聊失败:', error)
        Message.error('退出群聊失败，请重试')
      }
    }

    // 解散群聊（仅群主可用）
    const handleDisbandGroup = async () => {
      if (!groupId.value)
        return

      await MessageBox.confirm('确定要解散该群聊吗？此操作不可恢复！', '确认操作')

      await deleteGroupApi({
        groupId: groupId.value,
      })
      Message.success('已解散群聊')
      // 关闭详情面板
      closeDetails()
      // TODO: 需要更新会话列表，移除该群聊
    }

    return {
      isVisible,
      groupInfo,
      groupMembers,
      displayedMembers,
      topEnabled,
      muteEnabled,
      showAllMembers,
      closeDetails,
      toggleShowAllMembers,
      handleSettingsChange,
      avatarInputRef,
      handleAvatarClick,
      handleAvatarChange,
      handleAddMember,
      handleAddMemberConfirm,
      handleMemberContextMenu,
      handleRemoveMember,
      handleLeaveGroup,
      showAddMemberModal,
      canManageMembers,
      currentUserId,
      currentUserRole,
      handleDisbandGroup,
    }
  },
})
</script>

<style lang="less" scoped>
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
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);

    .avatar-edit-icon {
      opacity: 1;
    }
  }

  .group-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    opacity: 0;
    transition: opacity 0.2s;

    img {
      width: 14px;
      height: 14px;
      fill: #FFFFFF;
    }
  }
}

.group-name-container {
  flex: 1;
}

.group-name {
  font-size: 20px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8px;
}

.group-id {
  font-size: 13px;
  color: #B2BEC3;
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

  &:hover {
    background-color: #EBEEF5;
  }
}

.members-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  flex-shrink: 0;
  margin-bottom: 16px;
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
  overflow: hidden;
  position: relative;

  .member-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .member-remove-btn {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    background-color: #FF5252;
    border: 2px solid #FFFFFF;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;

    img {
      width: 10px;
      height: 10px;
      filter: brightness(0) invert(1);
    }

    &:hover {
      transform: scale(1.1);
    }
  }
}

.member-item:hover .member-avatar .member-remove-btn {
  display: flex;
}

.member-item {
  cursor: pointer;

  &:hover .member-avatar {
    transform: translateY(-1px);
  }
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

  &:hover {
    background-color: #F9FAFB;
  }
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

  &:last-child {
    border-bottom: none;
  }
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

/* 退出/解散群聊按钮 */
.leave-group-btn {
  width: 100%;
  margin-top: 24px;
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
