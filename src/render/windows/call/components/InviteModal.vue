<template>
  <div v-if="visible" class="invite-modal-mask" @click.self="$emit('close')">
    <div class="invite-modal-container">
      <div class="modal-header">
        <h3>邀请成员</h3>
        <div class="close-btn" @click="$emit('close')">✕</div>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">加载中...</div>
        <div v-else-if="memberList.length === 0" class="empty-state">暂无可邀请的成员</div>
        <div v-else class="member-list">
          <div v-for="member in memberList" :key="member.userId" class="member-item"
            :class="{ 'selected': selectedIds.includes(member.userId) }" @click="toggleSelect(member.userId)">
            <BeaverImage :file-name="member.avatar" image-class="member-avatar" :cache-type="CacheType.USER_AVATAR" />
            <span class="member-name">{{ member.nickName || member.userId }}</span>
            <div class="checkbox">
              <div v-if="selectedIds.includes(member.userId)" class="checked-icon">✓</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="confirm-btn" :disabled="selectedIds.length === 0" @click="handleConfirm">
          确定{{ selectedIds.length ? `(${selectedIds.length})` : '' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { usecallStore } from '../pinia/call'
import { inviteCallMemberApi } from 'renderModule/api/call'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'InviteModal',
  components: {
    BeaverImage
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const callStore = usecallStore()
    const loading = ref(true)
    const memberList = ref<any[]>([])
    const selectedIds = ref<string[]>([])

    const fetchMembers = async () => {
      const convId = callStore.baseInfo.conversationId
      if (!convId) return

      loading.value = true
      try {
        // 1. 转换 ID：如果是 group_xxx，则剥离前缀拿到真实群 ID
        const realGroupId = convId.startsWith('group_') ? convId.replace('group_', '') : convId

        const res = await (window as any).electron.database.group.getGroupMembers({
          groupId: realGroupId
        })

        if (res?.list) {
          // 2. 过滤掉已经在通话中的人 + 自己
          const activeIds = callStore.members.map(m => m.userId)
          const myId = callStore.myUserId
          memberList.value = res.list.filter((m: any) => {
            return !activeIds.includes(m.userId) && m.userId !== myId
          })
        }
      } catch (e) {
        console.error('获取群成员失败', e)
      } finally {
        loading.value = false
      }
    }

    const toggleSelect = (userId: string) => {
      const index = selectedIds.value.indexOf(userId)
      if (index > -1) {
        selectedIds.value.splice(index, 1)
      } else {
        selectedIds.value.push(userId)
      }
    }

    const handleConfirm = async () => {
      if (selectedIds.value.length === 0) return

      try {
        await inviteCallMemberApi({
          roomId: callStore.roomInfo.roomId,
          targetIds: selectedIds.value
        })

        // 发送完邀请后，可以手动在 UI 上增加这些成员为 'calling' 状态，或者等待后端 WS 回调
        // 这里为了体验更好，直接预植入
        selectedIds.value.forEach(uid => {
          callStore.upsertMember(uid, { status: 'calling' })
        })

        emit('close')
      } catch (e) {
        console.error('邀请失败', e)
      }
    }

    onMounted(() => {
      fetchMembers()
    })

    return {
      loading,
      memberList,
      selectedIds,
      toggleSelect,
      handleConfirm,
      CacheType
    }
  }
})
</script>

<style lang="less" scoped>
.invite-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.invite-modal-container {
  width: 400px;
  background: #1e2022;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #fff;
    }

    .close-btn {
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 18px;

      &:hover {
        color: #fff;
      }
    }
  }

  .modal-body {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px 0;

    .loading-state,
    .empty-state {
      padding: 40px;
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 14px;
    }

    .member-list {
      display: flex;
      flex-direction: column;

      .member-item {
        padding: 10px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        &.selected {
          background: rgba(74, 144, 226, 0.1);
        }

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
        }

        .member-name {
          flex: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;

          .checked-icon {
            color: #4a90e2;
            font-size: 12px;
            font-weight: bold;
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    button {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .cancel-btn {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .confirm-btn {
      background: #4a90e2;
      color: #fff;

      &:hover:not(:disabled) {
        background: #357abd;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
