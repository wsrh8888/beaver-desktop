<template>
  <div class="friend-notification-container">
    <!-- 通知列表 -->
    <div class="notification-list">
      <NotificationItem
        v-for="item in notifications"
        :key="item.id"
        :item="item"
        @approve="handleFriendRequest($event, 'approve')"
        @reject="handleFriendRequest($event, 'reject')"
      />

      <!-- 空状态 -->
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-text">
          暂无好友通知
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { INotificationItem } from 'commonModule/type/view/notification'
import { valiFrienddAPi } from 'renderModule/api/friend'
import { useFriendVerifyStore } from 'renderModule/app/pinia/friend/friend_verify'
import { computed, defineComponent, onMounted, ref } from 'vue'
import NotificationItem from './item.vue'

export default defineComponent({
  name: 'FriendNotificationContent',
  components: {
    NotificationItem,
  },
  setup() {
    const notifications = ref<INotificationItem[]>([])
    const friendVerifyStore = useFriendVerifyStore()
    const friendVerifyList = computed(() => friendVerifyStore.friendVerifyList)

    onMounted(() => {
      loadNotifications()
    })

    const loadNotifications = async () => {
      notifications.value = friendVerifyList.value.map((item) => {
        return {
          id: item.id,
          name: item.nickname,
          avatar: item.avatar,
          time: item.createdAt,
          message: item.message,
          status: item.status,
          headerText: getHeaderText(item.flag),
          statusResult: getStatusResult(item.flag, item.status),
        }
      })
    }

    const getHeaderText = (flag: string) => {
      switch (flag) {
        case 'send':
          return '正在验证你的申请'
        case 'receive':
          return '请求加你为好友'
        default:
          return ''
      }
    }

    const getStatusResult = (flag: string, status: number) => {
      switch (status) {
        case 1:
          return '已同意'
        case 2:
          return '已拒绝'
        default:
          if (flag === 'send') {
            return '等待验证'
          }
          return ''
      }
    }

    const handleFriendRequest = async (item: any, action: 'approve' | 'reject') => {
      const status = action === 'approve' ? 1 : 2
      await valiFrienddAPi({
        verifyId: item.id,
        status,
      })
    }

    return {
      notifications,
      handleFriendRequest,
    }
  },
})
</script>

<style lang="less" scoped>
.friend-notification-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
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
</style>
