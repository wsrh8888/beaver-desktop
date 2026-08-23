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
  <div class="notification-message">
    <span class="notification-text">{{ notificationText }}</span>
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { useContactStore } from 'renderModule/windows/app/pinia/contact/contact'
import { useGroupMemberStore } from 'renderModule/windows/app/pinia/group/group-member'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'NotificationMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    const contactStore = useContactStore()
    const groupMemberStore = useGroupMemberStore()

    // 根据通知类型和actors生成通知文本
    const notificationText = computed(() => {
      const notificationMsg = props.msg.notificationMsg
      if (!notificationMsg) {
        return '[通知消息]'
      }

      const { type, actors } = notificationMsg
      if (!actors || actors.length === 0) {
        return '[通知消息]'
      }

      // 获取用户昵称列表
      const actorNames = actors.map((userId: string) => {
        // 优先从群成员获取（群聊场景）
        const groupMember = groupMemberStore.getMemberByUserId(userId)
        if (groupMember) {
          return groupMember.nickName || userId
        }

        // 从联系人获取
        const contact = contactStore.getContact(userId)
        if (contact) {
          return contact.nickName || userId
        }

        // 如果都没有，返回用户ID
        return userId
      })

      // 根据通知类型生成文本
      switch (type) {
        case 1: // 好友欢迎
          return `${actorNames.join('、')} 成为了好友`
        case 2: // 创建群
          return `${actorNames.join('、')} 创建了群聊`
        case 3: // 加入群
          return `${actorNames.join('、')} 加入了群聊`
        case 4: // 退出群
          return `${actorNames.join('、')} 退出了群聊`
        case 5: // 踢出成员
          return `${actorNames.join('、')} 被移出群聊`
        case 6: // 转让群主
          return `群主已转让给 ${actorNames.join('、')}`
        case 7: // 添加群机器人
          return `${actorNames[0]} 添加了群机器人`
        case 8: // 移除群机器人
          return `${actorNames[0]} 移除了群机器人`
        default:
          return `[通知消息]`
      }
    })

    return {
      notificationText,
    }
  },
})
</script>

<style lang="less" scoped>
.notification-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.notification-text {
  font-size: 12px;
  text-align: center;
  line-height: 1.5;
}
</style>
