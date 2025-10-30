import { defineStore } from 'pinia'

/**
 * @description: WebSocket消息管理 - 现在通过Main进程处理
 */
export const useWsStore = defineStore('useWsStore', {
  actions: {
    /**
     * @description: 处理来自Main进程的消息
     */
    handleMainProcessMessage(data: any) {
      console.log('收到Main进程消息:', data)

      // 只处理聊天消息
      if (data.command === 'CHAT_MESSAGE') {
        this.handleChatMessage(data.content)
      }
    },

    /**
     * @description: 处理聊天消息
     */
    handleChatMessage(content: any) {
      const messageData = content.data

      // 处理发送消息、接收消息和同步消息
      if (messageData.type === 'private_message_send'
        || messageData.type === 'group_message_send'
        || messageData.type === 'private_message_sync'
        || messageData.type === 'group_message_sync'
        || messageData.type === 'private_message_receive'
        || messageData.type === 'group_message_receive') {
        // 直接处理消息，不再通过message-manager
        // 这里可以触发Pinia store的更新
        console.log('处理聊天消息:', messageData)
      }
    },
  },
})
