import { defineStore } from 'pinia';

/**
 * @description: WebSocket消息管理
 */
export const useWsStore = defineStore('useWsStore', {
  actions: {
    /**
     * @description: 解析WebSocket消息
     */
    parseWsMessage(data: any) {
      console.log('收到WebSocket消息:', data);
      
      // 只处理聊天消息
      if (data.command === 'CHAT_MESSAGE') {
        this.handleChatMessage(data.content);
      }
    },

    /**
     * @description: 处理聊天消息
     */
    handleChatMessage(content: any) {
      const messageData = content.data;
      
      // 处理发送消息、接收消息和同步消息
      if (messageData.type === 'private_message_send' || 
          messageData.type === 'group_message_send' ||
          messageData.type === 'private_message_sync' ||
          messageData.type === 'group_message_sync' ||
          messageData.type === 'private_message_receive' ||
          messageData.type === 'group_message_receive') {
        
        // 使用消息管理器处理服务端消息（自动去重）
        import('renderModule/app/message-manager').then(({ messageManager }) => {
          messageManager.handleServerMessage({
            messageId: content.messageId,
            conversationId: messageData.body.conversationId,
            id: messageData.body.id,
            msg: messageData.body.msg,
            sender: messageData.body.sender,
            create_at: messageData.body.create_at
          });
        });
      }
    }
  },
});
