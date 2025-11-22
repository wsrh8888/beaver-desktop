<template>
  <div class="notification-message">
    <span class="notification-text">{{ notificationText }}</span>
  </div>
</template>

<script lang="ts">
import { useContactStore } from 'renderModule/windows/app/pinia/contact/contact'
import { useGroupMemberStore } from 'renderModule/windows/app/pinia/group/group-member'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'NotificationMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const contactStore = useContactStore()
    const groupMemberStore = useGroupMemberStore()

    // 根据通知类型和actors生成通知文本
    const notificationText = computed(() => {
      const notificationMsg = props.message.msg.notificationMsg
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
          return groupMember.nickname || userId
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
  color: #909399;
  text-align: center;
  line-height: 1.5;
}
</style>
