<template>
  <div v-if="visible" class="invite-modal-mask" @click.self="$emit('close')">
    <div class="invite-modal-container">
      <div class="modal-header">
        <span class="title">邀请成员加入</span>
        <div class="close-btn" @click="$emit('close')">
          <img src="renderModule/assets/image/header/close.svg" alt="close">
        </div>
      </div>

      <div class="modal-body">
        <div v-if="filteredMembers.length === 0" class="empty-state">
          <img src="renderModule/assets/image/call/mute.svg" class="empty-icon" alt="empty">
          <span>暂无可邀请的成员</span>
        </div>

        <div v-else class="member-list">
          <div v-for="member in filteredMembers" :key="member.userId" class="member-item"
            @click="toggleSelect(member.userId)">
            <div class="avatar-wrap">
              <BeaverImage :file-name="member.avatar" image-class="member-avatar" :cache-type="CacheType.USER_AVATAR" />
            </div>
            <span class="member-name">{{ member.nickName || member.userId }}</span>
            <div class="checkbox" :class="{ 'checked': selectedIds.includes(member.userId) }">
              <span v-if="selectedIds.includes(member.userId)" class="check-mark">L</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="selection-count" v-if="selectedIds.length > 0">
          已选择 <span>{{ selectedIds.length }}</span> 位成员
        </div>
        <div class="btn-group">
          <button class="cancel-btn" @click="$emit('close')">取消</button>
          <button class="confirm-btn" :disabled="selectedIds.length === 0" @click="handleConfirm">
            立即邀请
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { usecallStore } from '../../pinia/call'
import { useUserStore } from '../../pinia/user'
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
  setup(_, { emit }) {
    const callStore = usecallStore()
    const memberList = ref<any[]>([])
    const selectedIds = ref<string[]>([])
    const searchText = ref('')

    const filteredMembers = computed(() => {
      if (!searchText.value) return memberList.value
      const kw = searchText.value.toLowerCase()
      return memberList.value.filter(m =>
        (m.nickName || '').toLowerCase().includes(kw) ||
        m.userId.toLowerCase().includes(kw)
      )
    })

    const fetchMembers = async () => {
      const convId = callStore.baseInfo.conversationId
      if (!convId) return

      try {
        const realGroupId = convId.startsWith('group_') ? convId.replace('group_', '') : convId
        const res = await (window as any).electron.database.group.getGroupMembers({
          groupId: realGroupId
        })

        if (res?.list) {
          const activeIds = callStore.members.map(m => m.userId)
          const myId = useUserStore().getUserId
          memberList.value = res.list.filter((m: any) => {
            return !activeIds.includes(m.userId) && m.userId !== myId
          })
        }
      } catch (e) {
        console.error('获取群成员失败', e)
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

        selectedIds.value.forEach(uid => {
          console.error('1111111111111111111111111111111', JSON.stringify(selectedIds.value))
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
      memberList,
      filteredMembers,
      selectedIds,
      searchText,
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.invite-modal-container {
  width: 440px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #f0f0f0;

  .modal-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f5f5f5;

    .title {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .close-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;

      img {
        width: 12px;
        height: 12px;
        opacity: 0.5;
      }

      &:hover {
        background: #f5f5f5;

        img {
          opacity: 0.8;
        }
      }
    }
  }

  .modal-body {
    height: 400px;
    display: flex;
    flex-direction: column;
    padding: 12px 0;

    .search-box {
      padding: 0 20px 12px;

      input {
        width: 100%;
        height: 36px;
        background: #f5f7fa;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 0 12px;
        font-size: 13px;
        transition: all 0.2s;

        &:focus {
          outline: none;
          background: #fff;
          border-color: #ff7d45;
          box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.1);
        }
      }
    }

    .loading-state,
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 13px;
      gap: 12px;
    }

    .member-list {
      flex: 1;
      overflow-y: auto;

      .member-item {
        padding: 8px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f9fafb;
        }

        .avatar-wrap {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          overflow: hidden;
          background: #f0f0f0;

          .member-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .member-name {
          flex: 1;
          font-size: 14px;
          color: #333;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 1.5px solid #dcdfe6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;

          &.checked {
            background: #ff7d45;
            border-color: #ff7d45;

            .check-mark {
              color: #fff;
              font-size: 10px;
              transform: rotate(45deg) scaleX(-1);
              margin-bottom: 2px;
              font-weight: bold;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 12px 20px;
    display: flex;
    justify-content: center; // 关键：居中按钮
    align-items: center;
    border-top: 1px solid #f5f5f5;
    background: #fafafa;
    position: relative; // 为绝对定位的 count 提供参考

    .selection-count {
      position: absolute;
      left: 20px;
      font-size: 13px;
      color: #666;

      span {
        color: #ff7d45;
        font-weight: 600;
      }
    }

    .btn-group {
      display: flex;
      gap: 16px;
    }

    button {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .cancel-btn {
      background: #eee;
      color: #666;

      &:hover {
        background: #e5e5e5;
      }
    }

    .confirm-btn {
      background: #ff7d45;
      color: #fff;

      &:hover:not(:disabled) {
        background: #e66a35;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
