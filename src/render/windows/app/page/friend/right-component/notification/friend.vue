<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

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
import { valiFrienddAPi } from 'renderModule/api/friend'
import { useFriendVerifyStore } from 'renderModule/windows/app/pinia/friend/friend_verify'
import { computed, defineComponent, onMounted } from 'vue'
import NotificationItem from './item.vue'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('FriendNotificationContent')

export default defineComponent({
  name: 'FriendNotificationContent',
  components: {
    NotificationItem,
  },
  setup() {
    const friendVerifyStore = useFriendVerifyStore()
    const friendVerifyList = computed(() => friendVerifyStore.getVerifyList)

    // 将 notifications 改为 computed，直接基于 friendVerifyList 计算
    const notifications = computed(() => {
      return friendVerifyList.value.map((item) => {
        return {
          id: item.id,
          name: item.nickName,
          avatar: item.avatar,
          time: item.createdAt,
          message: item.message,
          status: item.status,
          headerText: getHeaderText(item.flag),
          statusResult: getStatusResult(item.flag, item.status),
        }
      })
    })

    onMounted(async () => {
      await friendVerifyStore.init()
      logger.info({ text: '好友验证列表', data: { list: friendVerifyList.value } })
    })

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

      try {
        await valiFrienddAPi({
          verifyId: item.id,
          status,
        })

        // API调用成功后，立即更新本地store中的状态
        const verifyItem = friendVerifyStore.friendVerifyList.find(v => v.verifyId === item.id)
        if (verifyItem) {
          verifyItem.status = status
        }
        logger.info({ text: '好友验证列表已更新', data: { list: friendVerifyStore.friendVerifyList } })
        logger.info({ text: '处理好友申请项', data: { item } })
      } catch (error) {
        logger.error({ text: '处理好友申请失败', data: { error } })
        // 可以在这里显示错误提示给用户
      }
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

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F9FAFB;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    border-radius: 2px;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #E86835 0%, #FF7D45 100%);
      box-shadow: 0 0 6px rgba(255, 125, 69, 0.3);
    }
  }

  &::-webkit-scrollbar-corner {
    background: #F9FAFB;
  }
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
