<template>
  <div class="circle-details">
    <div class="circle-details-sidebar active">
      <div class="circle-details-header">
        <h3>圈子详情</h3>
        <button class="circle-details-close" type="button" @click="$emit('close')">
          <img src="renderModule/assets/image/group/close.svg" alt="关闭">
        </button>
      </div>

      <div class="circle-details-body">
        <div class="circle-details-profile">
          <div class="circle-details-avatar-wrap">
            <div class="circle-details-avatar" @click="triggerAvatarInput">
              <BeaverImage
                v-if="avatar"
                :file-name="avatar"
                alt="圈子头像"
                image-class="circle-details-avatar-img"
              />
              <span v-else class="circle-details-avatar-text">{{ name.slice(0, 1) }}</span>
              <div v-if="canManage" class="circle-details-avatar-edit">
                <img src="renderModule/assets/image/group/edit.svg" alt="编辑">
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              class="circle-details-avatar-input"
              @change="onAvatarInputChange"
            >
          </div>
          <div class="circle-details-name-wrap">
            <div class="circle-details-name">
              {{ name }}
            </div>
            <div class="circle-details-id">
              圈子ID: {{ normalizedId }}
            </div>
            <div v-if="description" class="circle-details-desc">
              {{ description }}
            </div>
          </div>
        </div>

        <div class="circle-details-members">
          <div class="circle-details-members-head">
            <div>
              <span class="circle-details-members-title">圈成员</span>
              <span class="circle-details-members-count">({{ memberList.length }}人)</span>
            </div>
            <button
              v-if="canManage"
              class="circle-details-add-member"
              type="button"
              @click="handleAddMember"
            >
              <img src="renderModule/assets/image/group/add.svg" alt="添加">
              添加成员
            </button>
          </div>

          <div v-if="memberList.length > 0" class="circle-details-members-grid">
            <div
              v-for="member in displayedMembers"
              :key="member.userId"
              class="circle-details-member"
              @contextmenu.prevent="handleMemberContextMenu(member)"
            >
              <div class="circle-details-member-avatar">
                <BeaverImage
                  v-if="member.avatar"
                  :file-name="member.avatar"
                  :cache-type="CacheType.USER_AVATAR"
                  alt="成员头像"
                  image-class="circle-details-member-avatar-img"
                />
                <button
                  v-if="canRemoveMember(member)"
                  class="circle-details-member-remove"
                  type="button"
                  @click.stop="handleRemoveMember(member.userId)"
                >
                  <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
                </button>
              </div>
              <div class="circle-details-member-name">
                {{ member.userName || member.userId }}
              </div>
            </div>
          </div>
          <div v-else class="circle-details-empty">
            暂无成员
          </div>

          <div
            v-if="memberList.length > 16"
            class="circle-details-show-more"
            @click="showAllMembers = !showAllMembers"
          >
            {{ showAllMembers ? '收起成员列表' : '查看更多成员' }}
            <img
              src="renderModule/assets/image/group/expand.svg"
              alt="展开"
              :style="{ transform: showAllMembers ? 'rotate(180deg)' : 'rotate(0)' }"
            >
          </div>
        </div>

        <div class="circle-details-settings">
          <div class="circle-details-settings-item" @click="openShare">
            <span>分享圈子</span>
            <img src="renderModule/assets/image/group/expand.svg" alt="">
          </div>
        </div>

        <button
          v-if="isOwner"
          class="circle-details-danger"
          type="button"
          @click="handleDelete"
        >
          解散圈子
        </button>
        <button
          v-else
          class="circle-details-danger"
          type="button"
          @click="handleQuit"
        >
          退出圈子
        </button>
      </div>
    </div>

    <div class="circle-details-overlay active" @click="$emit('close')" />

    <SelectFriend
      v-if="showAddMemberModal"
      v-model="showAddMemberModal"
      title="添加圈成员"
      :disabled-ids="memberList.map(m => m.userId)"
      @confirm="handleAddMemberConfirm"
    />

    <Share
      v-if="normalizedId && shareVisible"
      v-model="shareVisible"
      :card-type="CardType.CIRCLE"
      :id="normalizedId"
      :name="name"
      :avatar="avatar"
      :invite-url="detail?.inviteUrl || ''"
    />
  </div>
</template>

<script lang="ts">
import type { ICircleMemberItem, IGetCircleDetailRes } from 'commonModule/type/ajax/circle'
import { CardType } from 'commonModule/type/ajax/chat'
import { CacheType } from 'commonModule/type/cache/cache'
import { computed, defineComponent, onMounted, ref } from 'vue'
import {
  deleteCircleApi,
  getCircleDetailApi,
  getCircleMembersApi,
  inviteCircleMembersApi,
  quitCircleApi,
  removeCircleMembersApi,
  updateCircleApi,
} from 'renderModule/api/circle'
import SelectFriend from 'renderModule/components/business/selectFriend/index.vue'
import Share from 'renderModule/components/business/share/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import MessageBox from 'renderModule/components/ui/messagebox'
import { uploadFile } from 'renderModule/utils/upload'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { parseCircleId, useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleDetails',
  components: { BeaverImage, Share, SelectFriend },
  props: {
    circleId: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'quit', 'updated'],
  setup(props, { emit }) {
    const circleStore = useCircleStore()
    const userStore = useUserStore()
    const shareVisible = ref(false)
    const showAddMemberModal = ref(false)
    const showAllMembers = ref(false)
    const avatarInputRef = ref<HTMLInputElement | null>(null)
    const detail = ref<IGetCircleDetailRes | null>(null)
    const memberList = ref<ICircleMemberItem[]>([])
    const currentUserId = ref('')

    const normalizedId = computed(() => parseCircleId(props.circleId || ''))
    const name = computed(() => detail.value?.name || '圈子')
    const avatar = computed(() => detail.value?.avatar || '')
    const description = computed(() => detail.value?.description || '')
    const role = computed(() => detail.value?.role || 0)
    const isOwner = computed(() => role.value === 1)
    const canManage = computed(() => role.value === 1 || role.value === 2)
    const displayedMembers = computed(() => {
      return showAllMembers.value ? memberList.value : memberList.value.slice(0, 16)
    })

    const ensureUserId = async () => {
      if (!userStore.getUserId)
        await userStore.init()
      currentUserId.value = userStore.getUserId || ''
      if (!currentUserId.value) {
        const info = await electron.storage.getAsync('userInfo')
        currentUserId.value = info?.userId || ''
      }
    }

    const loadDetail = async () => {
      const id = normalizedId.value
      if (!id)
        return
      const res = await getCircleDetailApi({ circleId: id })
      if (res.code !== 0) {
        Message.error(res.msg || '获取圈子详情失败')
        return
      }
      detail.value = res.result
    }

    const loadMembers = async () => {
      const id = normalizedId.value
      if (!id)
        return
      const res = await getCircleMembersApi({
        circleId: id,
        page: 1,
        limit: 100,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '获取成员失败')
        return
      }
      memberList.value = res.result.list || []
    }

    onMounted(async () => {
      await ensureUserId()
      await loadDetail()
      await loadMembers()
    })

    const triggerAvatarInput = () => {
      if (!canManage.value)
        return
      avatarInputRef.value?.click()
    }

    const onAvatarInputChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !normalizedId.value)
        return
      const uploadResult = await uploadFile(file)
      if (!uploadResult?.fileUrl) {
        Message.error('头像上传失败，请重试')
        return
      }
      const res = await updateCircleApi({
        circleId: normalizedId.value,
        avatar: uploadResult.fileUrl,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '更新头像失败')
      }
      else {
        Message.success('头像已更新')
        await loadDetail()
        await circleStore.loadMyCircles()
        emit('updated')
      }
      if (avatarInputRef.value)
        avatarInputRef.value.value = ''
    }

    const handleAddMember = async () => {
      if (!canManage.value) {
        Message.warning('只有圈主和管理员可以添加成员')
        return
      }
      await ensureUserId()
      showAddMemberModal.value = true
    }

    const handleAddMemberConfirm = async (userIds: string[]) => {
      if (!normalizedId.value || userIds.length === 0)
        return
      const res = await inviteCircleMembersApi({
        circleId: normalizedId.value,
        userIds,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '添加成员失败')
        return
      }
      Message.success('添加成员成功')
      showAddMemberModal.value = false
      await loadMembers()
      await loadDetail()
      emit('updated')
    }

    const canRemoveMember = (member: ICircleMemberItem) => {
      if (!canManage.value || currentUserId.value === member.userId)
        return false
      if (isOwner.value)
        return member.role !== 1
      return member.role === 3
    }

    const handleMemberContextMenu = (member: ICircleMemberItem) => {
      if (!canRemoveMember(member))
        return
      MessageBox.confirm(`确定要移除成员 ${member.userName || member.userId} 吗？`, '确认操作')
        .then(() => handleRemoveMember(member.userId))
        .catch(() => {})
    }

    const handleRemoveMember = async (userId: string) => {
      if (!normalizedId.value)
        return
      const res = await removeCircleMembersApi({
        circleId: normalizedId.value,
        userIds: [userId],
      })
      if (res.code !== 0) {
        Message.error(res.msg || '移除成员失败')
        return
      }
      Message.success('移除成员成功')
      await loadMembers()
      await loadDetail()
      emit('updated')
    }

    const handleQuit = async () => {
      if (!normalizedId.value)
        return
      await MessageBox.confirm('确定要退出该圈子吗？', '确认操作')
      const res = await quitCircleApi({ circleId: normalizedId.value })
      if (res.code !== 0) {
        Message.error(res.msg || '退出圈子失败')
        return
      }
      Message.success('已退出圈子')
      await circleStore.loadMyCircles()
      emit('quit')
    }

    const handleDelete = async () => {
      if (!normalizedId.value)
        return
      await MessageBox.confirm('确定要解散该圈子吗？此操作不可恢复！', '确认操作')
      const res = await deleteCircleApi({ circleId: normalizedId.value })
      if (res.code !== 0) {
        Message.error(res.msg || '解散圈子失败')
        return
      }
      Message.success('圈子已解散')
      await circleStore.loadMyCircles()
      emit('quit')
    }

    const openShare = () => {
      if (!detail.value?.inviteUrl) {
        Message.error('暂无可用邀请链接')
        return
      }
      shareVisible.value = true
    }

    return {
      CacheType,
      CardType,
      shareVisible,
      showAddMemberModal,
      showAllMembers,
      avatarInputRef,
      memberList,
      currentUserId,
      displayedMembers,
      normalizedId,
      name,
      avatar,
      description,
      isOwner,
      canManage,
      detail,
      openShare,
      triggerAvatarInput,
      onAvatarInputChange,
      handleAddMember,
      handleAddMemberConfirm,
      canRemoveMember,
      handleMemberContextMenu,
      handleRemoveMember,
      handleQuit,
      handleDelete,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-details {
  pointer-events: none;
  z-index: 100;
}

.circle-details-sidebar {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100%;
  background: #FFFFFF;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  z-index: 101;

  &.active {
    right: 0;
  }
}

.circle-details-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 100;
  pointer-events: none;

  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}

.circle-details-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }
}

.circle-details-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;

  img {
    width: 12px;
    height: 12px;
  }
}

.circle-details-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.circle-details-profile {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EBEEF5;
}

.circle-details-avatar-wrap {
  position: relative;
  margin-right: 20px;
  flex-shrink: 0;
}

.circle-details-avatar-input {
  display: none;
}

.circle-details-avatar {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #FFE6D9;
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

  &:hover {
    .circle-details-avatar-edit {
      opacity: 1;
    }
  }
}

.circle-details-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-details-avatar-text {
  font-size: 28px;
  font-weight: 600;
}

.circle-details-avatar-edit {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background: #FF7D45;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s;

  img {
    width: 14px;
    height: 14px;
  }
}

.circle-details-name-wrap {
  flex: 1;
  min-width: 0;
}

.circle-details-name {
  font-size: 20px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-details-id {
  font-size: 13px;
  color: #B2BEC3;
}

.circle-details-desc {
  margin-top: 8px;
  font-size: 12px;
  color: #636E72;
  line-height: 1.5;
}

.circle-details-members {
  margin-bottom: 10px;
}

.circle-details-members-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.circle-details-members-title {
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
}

.circle-details-members-count {
  color: #B2BEC3;
  margin-left: 6px;
  font-weight: normal;
}

.circle-details-add-member {
  height: 32px;
  border-radius: 16px;
  border: none;
  background: #F9FAFB;
  padding: 0 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #636E72;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  img {
    width: 16px;
    height: 16px;
    margin-right: 6px;
  }
}

.circle-details-empty {
  padding: 16px 0;
  color: #95A5A6;
  font-size: 13px;
}

.circle-details-members-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.circle-details-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  flex-shrink: 0;
  margin-bottom: 16px;
  cursor: pointer;
}

.circle-details-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #D9E6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.circle-details-member-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-details-member-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  background: #FF5252;
  border: 2px solid #FFFFFF;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  img {
    width: 10px;
    height: 10px;
    filter: brightness(0) invert(1);
  }
}

.circle-details-member:hover .circle-details-member-remove {
  display: flex;
}

.circle-details-member-name {
  font-size: 12px;
  color: #636E72;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
  box-sizing: border-box;
}

.circle-details-show-more {
  width: 100%;
  text-align: center;
  margin-top: 12px;
  cursor: pointer;
  font-size: 13px;
  color: #4A6FA1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  img {
    width: 12px;
    height: 12px;
    transition: transform 0.2s;
  }
}

.circle-details-settings {
  margin-top: 24px;
  border-top: 1px solid #EBEEF5;
}

.circle-details-settings-item {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 14px;
  color: #2D3436;

  img {
    width: 12px;
    height: 12px;
    transform: rotate(-90deg);
    opacity: 0.5;
  }
}

.circle-details-danger {
  width: 100%;
  height: 40px;
  margin-top: 24px;
  border: 1px solid #FFD0D0;
  border-radius: 6px;
  background: #FFF5F5;
  color: #E74C3C;
  font-size: 14px;
  cursor: pointer;
}
</style>
