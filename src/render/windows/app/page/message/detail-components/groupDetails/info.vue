<template>
  <div class="group-details-info">
    <div class="group-details-info__content">
      <div class="group-details-info__profile">
        <div class="group-details-info__avatar-wrap">
          <div v-if="groupInfo" class="group-details-info__avatar" @click="triggerAvatarInput">
            <BeaverImage
              v-if="groupInfo.avatar"
              :file-name="groupInfo.avatar"
              alt="群头像"
              image-class="group-details-info__avatar-image"
            />
            <span v-else class="group-details-info__avatar-text">{{ groupInfo.title }}</span>
            <div class="group-details-info__avatar-edit">
              <img src="renderModule/assets/image/group/edit.svg" alt="编辑">
            </div>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="group-details-info__avatar-input"
            @change="onAvatarInputChange"
          >
        </div>
        <div class="group-details-info__name-wrap">
          <div class="group-details-info__name">
            {{ groupInfo ? groupInfo.title : '群聊' }}
          </div>
          <div v-if="groupInfo" class="group-details-info__id">
            群ID: {{ groupInfo.groupId }}
          </div>
        </div>
      </div>

      <div class="group-details-info__members">
        <div class="group-details-info__members-head">
          <div>
            <span class="group-details-info__members-title">群成员</span>
            <span v-if="groupInfo" class="group-details-info__members-count">({{ groupMembers.length }}人)</span>
          </div>
          <button
            v-if="canManageMembers"
            class="group-details-info__add-member"
            type="button"
            @click="handleAddMember"
          >
            <img src="renderModule/assets/image/group/add.svg" alt="添加">
            添加成员
          </button>
        </div>

        <div v-if="groupMembers && groupMembers.length > 0" class="group-details-info__members-grid">
          <div
            v-for="member in displayedMembers"
            :key="member.userId"
            class="group-details-info__member"
            @contextmenu.prevent="handleMemberContextMenu($event, member)"
          >
            <div class="group-details-info__member-avatar">
              <BeaverImage
                v-if="member.avatar"
                :file-name="member.avatar"
                alt="成员头像"
                image-class="group-details-info__member-avatar-image"
              />
              <button
                v-if="canManageMembers && currentUserId !== member.userId"
                class="group-details-info__member-remove"
                type="button"
                @click.stop="handleRemoveMember(member.userId)"
              >
                <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
              </button>
            </div>
            <div class="group-details-info__member-name">
              {{ member.nickName || member.userId }}
            </div>
          </div>
        </div>

        <div
          v-if="groupMembers && groupMembers.length > 16"
          class="group-details-info__show-more"
          @click="toggleShowAllMembers"
        >
          {{ showAllMembers ? '收起成员列表' : '查看更多成员' }}
          <img
            src="renderModule/assets/image/group/expand.svg"
            alt="展开"
            :style="{ transform: showAllMembers ? 'rotate(180deg)' : 'rotate(0)' }"
          >
        </div>
      </div>

      <div
        v-if="isGroupOwner"
        class="group-details-info__assistant-entry"
        @click="$emit('open', 'assistant')"
      >
        <span class="group-details-info__assistant-label">智能群助手</span>
        <img class="group-details-info__assistant-arrow" src="renderModule/assets/image/group/expand.svg" alt="">
      </div>

      <div class="group-details-info__settings">
        <div class="group-details-info__settings-title">
          群聊设置
        </div>
        <div class="group-details-info__settings-item">
          <div class="group-details-info__settings-label">
            置顶
          </div>
          <label class="group-details-info__switch">
            <input
              v-model="topEnabled"
              type="checkbox"
              @change="handleSettingsChange('top')"
            >
            <span class="group-details-info__switch-slider" />
          </label>
        </div>
        <div class="group-details-info__settings-item">
          <div class="group-details-info__settings-label">
            消息免打扰
          </div>
          <label class="group-details-info__switch">
            <input
              v-model="muteEnabled"
              type="checkbox"
              @change="handleSettingsChange('mute')"
            >
            <span class="group-details-info__switch-slider" />
          </label>
        </div>
      </div>

      <BeaverButton
        v-if="isGroupOwner"
        type="danger"
        size="large"
        class="group-details-info__action-btn"
        @click="handleDisbandGroup"
      >
        解散群聊
      </BeaverButton>
      <BeaverButton
        v-else
        type="default"
        size="large"
        class="group-details-info__action-btn"
        @click="handleLeaveGroup"
      >
        退出群聊
      </BeaverButton>
    </div>

    <AddGroupMember
      v-if="showAddMemberModal"
      :group-member-ids="groupMembers.map((m: { userId: string }) => m.userId)"
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
  name: 'groupDetailsInfo',
  components: { BeaverButton, BeaverImage, AddGroupMember },
  emits: ['open', 'close'],
  setup(_props, { emit }) {
    const groupStore = useGroupStore()
    const groupMemberStore = useGroupMemberStore()
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()
    const userStore = useUserStore()

    const showAllMembers = ref(false)
    const showAddMemberModal = ref(false)
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const topEnabled = ref(false)
    const muteEnabled = ref(false)

    const currentUserId = computed(() => userStore.getUserId)

    const groupInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null
      return groupStore.getGroupById(currentId)
    })

    const groupId = computed(() => {
      if (!groupInfo.value)
        return ''
      const conversationId = groupInfo.value.conversationId
      return conversationId.startsWith('group_')
        ? conversationId.split('_').slice(1).join('_')
        : conversationId
    })

    const groupMembers = computed(() => {
      if (!groupId.value)
        return []
      return groupMemberStore.getMembersByGroupId(groupId.value)
    })

    const displayedMembers = computed(() => {
      if (!groupMembers.value)
        return []
      return showAllMembers.value ? groupMembers.value : groupMembers.value.slice(0, 16)
    })

    const currentUserRole = computed(() => {
      if (!groupId.value || !currentUserId.value)
        return 0
      const member = groupMembers.value.find(m => m.userId === currentUserId.value)
      return member?.role || 0
    })

    const canManageMembers = computed(() => currentUserRole.value === 1 || currentUserRole.value === 2)
    const isGroupOwner = computed(() => currentUserRole.value === 1)

    const currentConversationInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null
      return conversationStore.getConversationInfo(currentId)
    })

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

    const toggleShowAllMembers = () => {
      showAllMembers.value = !showAllMembers.value
    }

    const triggerAvatarInput = () => {
      avatarInputRef.value?.click()
    }

    const onAvatarInputChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file)
        return
      const uploadResult = await uploadFile(file)
      if (uploadResult?.fileKey) {
        await updateGroupInfoApi({
          groupId: groupId.value,
          avatar: uploadResult.fileKey,
        })
        await groupStore.updateGroupInfo(groupInfo.value!.conversationId)
        Message.success('头像上传成功')
      }
      else {
        Message.error('头像上传失败，请重试')
      }
      if (avatarInputRef.value)
        avatarInputRef.value.value = ''
    }

    const handleAddMember = () => {
      if (!canManageMembers.value) {
        Message.warning('只有群主和管理员可以添加成员')
        return
      }
      showAddMemberModal.value = true
    }

    const handleAddMemberConfirm = async (userIds: string[]) => {
      if (!groupId.value || userIds.length === 0)
        return
      const result = await addGroupMemberApi({
        groupId: groupId.value,
        userIds,
      })
      if (result.code === 0) {
        Message.success('添加成员成功')
        await groupMemberStore.init(groupId.value)
      }
      else {
        Message.error(result.msg)
      }
    }

    const handleMemberContextMenu = (_event: MouseEvent, member: { userId: string, nickName?: string }) => {
      if (canManageMembers.value && currentUserId.value !== member.userId) {
        MessageBox.confirm(`确定要移除成员 ${member.nickName || member.userId} 吗？`, '确认操作')
          .then(() => handleRemoveMember(member.userId))
          .catch(() => {})
      }
    }

    const handleRemoveMember = async (memberId: string) => {
      if (!groupId.value)
        return
      await removeGroupMemberApi({
        groupId: groupId.value,
        userIds: [memberId],
      })
      groupMemberStore.removeMembers(groupId.value, [memberId])
      Message.success('移除成员成功')
    }

    const handleLeaveGroup = async () => {
      if (!groupId.value)
        return
      await MessageBox.confirm('确定要退出该群聊吗？', '确认操作')
      await quitGroupApi({ groupId: groupId.value })
      Message.success('已退出群聊')
      emit('close')
    }

    const handleDisbandGroup = async () => {
      if (!groupId.value)
        return
      await MessageBox.confirm('确定要解散该群聊吗？此操作不可恢复！', '确认操作')
      await deleteGroupApi({ groupId: groupId.value })
      Message.success('已解散群聊')
      emit('close')
    }

    return {
      groupInfo,
      groupMembers,
      displayedMembers,
      showAllMembers,
      topEnabled,
      muteEnabled,
      isGroupOwner,
      canManageMembers,
      currentUserId,
      showAddMemberModal,
      avatarInputRef,
      toggleShowAllMembers,
      triggerAvatarInput,
      onAvatarInputChange,
      handleSettingsChange,
      handleAddMember,
      handleAddMemberConfirm,
      handleMemberContextMenu,
      handleRemoveMember,
      handleLeaveGroup,
      handleDisbandGroup,
    }
  },
})
</script>

<style lang="less" scoped>
.group-details-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .group-details-info__content {
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
    }
  }

  .group-details-info__profile {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #ebeef5;
  }

  .group-details-info__avatar-wrap {
    position: relative;
    margin-right: 20px;
  }

  .group-details-info__avatar-input {
    display: none;
  }

  .group-details-info__avatar {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    background-color: #ffe6d9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff7d45;
    font-size: 28px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    cursor: pointer;

    &:hover {
      .group-details-info__avatar-edit {
        opacity: 1;
      }
    }
  }

  .group-details-info__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .group-details-info__avatar-text {
    font-size: 28px;
    font-weight: 600;
  }

  .group-details-info__avatar-edit {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 24px;
    height: 24px;
    background-color: #ff7d45;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.2s;

    img {
      width: 14px;
      height: 14px;
    }
  }

  .group-details-info__name-wrap {
    flex: 1;
  }

  .group-details-info__name {
    font-size: 20px;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 8px;
  }

  .group-details-info__id {
    font-size: 13px;
    color: #b2bec3;
  }

  .group-details-info__members {
    margin-bottom: 10px;
  }

  .group-details-info__members-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .group-details-info__members-title {
    font-size: 15px;
    font-weight: 600;
    color: #2d3436;
  }

  .group-details-info__members-count {
    color: #b2bec3;
    margin-left: 6px;
    font-weight: normal;
  }

  .group-details-info__add-member {
    height: 32px;
    border-radius: 16px;
    border: none;
    background-color: #f9fafb;
    padding: 0 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #636e72;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    img {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }
  }

  .group-details-info__members-grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .group-details-info__member {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60px;
    flex-shrink: 0;
    margin-bottom: 16px;
    cursor: pointer;
  }

  .group-details-info__member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: #d9e6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
  }

  .group-details-info__member-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .group-details-info__member-remove {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    background-color: #ff5252;
    border: 2px solid #ffffff;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

    img {
      width: 10px;
      height: 10px;
      filter: brightness(0) invert(1);
    }
  }

  .group-details-info__member:hover .group-details-info__member-remove {
    display: flex;
  }

  .group-details-info__member-name {
    font-size: 12px;
    color: #636e72;
    text-align: center;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
    box-sizing: border-box;
  }

  .group-details-info__show-more {
    width: 100%;
    text-align: center;
    margin-top: 20px;
    cursor: pointer;
    font-size: 13px;
    color: #4a6fa1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    border-radius: 6px;

    img {
      width: 16px;
      height: 16px;
      margin-left: 6px;
    }
  }

  .group-details-info__assistant-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .group-details-info__assistant-label {
    font-size: 15px;
    color: #2d3436;
  }

  .group-details-info__assistant-arrow {
    width: 16px;
    height: 16px;
    transform: rotate(-90deg);
    opacity: 0.5;
  }

  .group-details-info__settings {
    margin-bottom: 32px;
  }

  .group-details-info__settings-title {
    font-size: 15px;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 16px;
  }

  .group-details-info__settings-item {
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-details-info__settings-label {
    font-size: 14px;
    color: #636e72;
    flex: 1;
  }

  .group-details-info__switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }

  .group-details-info__switch-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ebeef5;
    transition: 0.3s;
    border-radius: 22px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 2px;
      bottom: 2px;
      background-color: #ffffff;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
  }

  .group-details-info__switch input:checked + .group-details-info__switch-slider {
    background-color: #ff7d45;

    &:before {
      transform: translateX(22px);
    }
  }

  .group-details-info__action-btn {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
