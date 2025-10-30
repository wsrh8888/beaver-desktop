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
import { defineComponent, onMounted, ref } from 'vue'
import NotificationItem from './item.vue'

export default defineComponent({
  name: 'GroupNotificationContent',
  components: {
    NotificationItem,
  },
  setup() {
    const notifications = ref<INotificationItem[]>([])

    onMounted(() => {
      // 模拟加载通知数据
      loadNotifications()
    })

    const getStatusText = (type: string, status: number) => {
      switch (type) {
        case 'group_invite':
          if (status === 1)
            return '已同意'
          return '邀请你加入群聊'
        case 'group_join_request':
          if (status === 1)
            return '已同意'
          if (status === 2)
            return '已拒绝'
          return '申请加入你的群聊'
        case 'group_owner_leave':
          return '通知'
        case 'group_member_change':
          return '通知'
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

    const loadNotifications = () => {
      // 模拟数据（目前没有群通知API，先使用模拟数据）
      notifications.value = [
        {
          id: '1',
          name: '前端交流群',
          avatar: '',
          time: Date.now() - 1000 * 60 * 60,
          message: '邀请你加入群聊',
          status: 1,
          isGroup: true,
          statusText: '已同意',
          statusClass: 'status-approved',
          canApprove: false,
          canReject: false,
        },
        {
          id: '2',
          name: '后端交流群',
          avatar: '',
          time: Date.now() - 1000 * 60 * 60 * 2,
          message: '群主已退出该群聊',
          status: 0,
          isGroup: true,
          statusText: '通知',
          statusClass: '',
          canApprove: false,
          canReject: false,
        },
        {
          id: '3',
          name: '王五',
          avatar: '',
          time: Date.now() - 1000 * 60 * 60 * 3,
          message: '申请加入你的群聊',
          status: 0,
          isGroup: false,
          statusText: '申请加入你的群聊',
          statusClass: '',
          canApprove: true,
          canReject: true,
        },
      ]
    }

    const handleGroupRequest = async (item: INotificationItem, action: 'approve' | 'reject') => {
      console.log('处理群请求:', item, action)
      // TODO: 调用API处理群请求（目前没有API，先模拟处理）
      const status = action === 'approve' ? 1 : 2
      const notification = notifications.value.find(n => n.id === item.id)
      if (notification) {
        notification.status = status
        notification.statusText = getStatusText('group_join_request', status)
        notification.statusClass = getStatusClass(status)
        notification.canApprove = false
        notification.canReject = false
        notification.message = status === 1 ? '你已同意对方的入群申请' : '你已拒绝对方的入群申请'
      }
    }

    const handleItemClick = (item: INotificationItem) => {
      console.log('点击群通知项:', item)
      // TODO: 处理通知项点击事件
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
