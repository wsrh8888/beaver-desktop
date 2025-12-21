<template>
  <div class="group-notification-container">
    <!-- 通知列表 -->
    <div class="notification-list">
      <NotificationItem
        v-for="item in notifications"
        :key="item.id"
        :item="item"
        @click="handleItemClick"
        @approve="handleGroupRequest($event, 'approve')"
        @reject="handleGroupRequest($event, 'reject')"
      />

      <!-- 空状态 -->
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-text">
          暂无群通知
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { INotificationItem } from 'commonModule/type/view/notification'
import { useGroupJoinRequestStore } from 'renderModule/windows/app/pinia/group/group-join-request'
import { computed, defineComponent, onMounted, ref } from 'vue'
import NotificationItem from './item.vue'

export default defineComponent({
  name: 'GroupNotificationContent',
  components: {
    NotificationItem,
  },
  setup() {
    const notifications = ref<INotificationItem[]>([])
    const groupJoinRequestStore = useGroupJoinRequestStore()
    const groupJoinRequestList = computed(() => groupJoinRequestStore.getEnhancedRequestList)

    onMounted(async () => {
      await groupJoinRequestStore.init()

      loadNotifications()
      console.log('群申请列表:', groupJoinRequestList.value)
    })

    const loadNotifications = async () => {
      notifications.value = groupJoinRequestList.value.map((item) => {
        return {
          id: item.requestId.toString(),
          name: item.applicantName,
          avatar: item.applicantAvatar,
          time: new Date(item.createdAt).toLocaleString(),
          message: item.message || '申请加入群聊',
          status: item.status,
          isGroup: false, // 申请者是个人，不是群
          headerText: getHeaderText(item.status),
          statusResult: getStatusResult(item.status),
          statusText: getStatusText(item.status),
          statusClass: getStatusClass(item.status),
          canApprove: item.status === 0,
          canReject: item.status === 0,
        } as INotificationItem
      })
    }

    const getHeaderText = (status: number) => {
      switch (status) {
        case 0:
          return '申请加入你的群聊'
        case 1:
          return '入群申请已同意'
        case 2:
          return '入群申请已拒绝'
        default:
          return '入群申请'
      }
    }

    const getStatusText = (status: number) => {
      switch (status) {
        case 0:
          return '申请加入你的群聊'
        case 1:
          return '已同意入群申请'
        case 2:
          return '已拒绝入群申请'
        default:
          return '入群申请'
      }
    }

    const getStatusResult = (status: number) => {
      switch (status) {
        case 1:
          return '已同意'
        case 2:
          return '已拒绝'
        default:
          return ''
      }
    }

    const getStatusClass = (status: number) => {
      switch (status) {
        case 1:
          return 'status-approved'
        case 2:
          return 'status-rejected'
        default:
          return ''
      }
    }

    const handleGroupRequest = async (item: INotificationItem, action: 'approve' | 'reject') => {
      const status = action === 'approve' ? 1 : 2
      const requestId = Number.parseInt(item.id)

      try {
        await groupJoinRequestStore.handleRequest(requestId, status)

        // 更新本地通知状态
        const notification = notifications.value.find(n => n.id === item.id)
        if (notification) {
          notification.status = status
          notification.statusText = getStatusText(status)
          notification.statusClass = getStatusClass(status)
          notification.canApprove = false
          notification.canReject = false
          notification.message = status === 1 ? '你已同意对方的入群申请' : '你已拒绝对方的入群申请'
        }
      }
      catch (error) {
        console.error('处理群申请失败:', error)
        // 可以在这里显示错误提示
      }
    }

    const handleItemClick = (item: INotificationItem) => {
      console.log('点击群通知项:', item)
      // TODO: 可以跳转到群详情或申请详情页面
    }

    return {
      notifications,
      handleGroupRequest,
      handleItemClick,
    }
  },
})
</script>

<style lang="less" scoped>
.group-notification-container {
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
