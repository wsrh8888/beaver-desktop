import { v4 as uuidv4 } from 'uuid';
import { MessageStatus, MessageType } from 'commonModule/type/ajax/chat';
import type { IChatHistory } from 'commonModule/type/ajax/chat';
import { useChatStore } from 'renderModule/app/pinia/chat/chat';
import { useUserStore } from 'renderModule/app/pinia/user/user';
import WsManager from 'renderModule/app/ws-manager/index';
import { processSenderAvatar } from 'renderModule/app/utils/avatar';

/**
 * @description: 消息管理器 - 统一处理消息发送、状态管理、去重等
 */
export class MessageManager {
  private static instance: MessageManager;
  private pendingMessages = new Map<string, IChatHistory>(); // 待确认的消息
  private chatStore = useChatStore();
  private userStore = useUserStore();

  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }

  /**
   * @description: 发送消息（统一入口）
   * @param conversationId 会话ID
   * @param messageContent 消息内容
   * @param messageType 消息类型
   */
  async sendMessage(
    conversationId: string, 
    messageContent: any, 
    messageType: MessageType = MessageType.TEXT
  ): Promise<string> {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 构建消息对象
    const message: IChatHistory = {
      messageId: parseInt(messageId.replace(/-/g, '').substring(0, 8), 16), // 转换为数字ID
      conversationId,
      msg: this.buildMessageContent(messageContent, messageType),
      sender: {
        userId: this.userStore.userInfo.userId,
        avatar: this.userStore.userInfo.avatar,
        nickname: this.userStore.userInfo.nickName
      },
      create_at: timestamp
    };

    try {
      // 1. 立即添加到本地（显示发送中状态）
      this.addLocalMessage(message, messageId);
      
      // 2. 发送到服务器
      await this.sendToServer(message, messageId);
      
      return messageId;
    } catch (error) {
      // 发送失败
      this.pendingMessages.delete(messageId);
      throw error;
    }
  }

  /**
   * @description: 处理服务端消息（去重处理）
   */
  handleServerMessage(serverMessage: any) {
    const { messageId, conversationId } = serverMessage;
    
    console.log('收到服务端消息:', serverMessage);
    
    // 检查是否是我们发送的消息的回显
    if (messageId && this.pendingMessages.has(messageId)) {
      // 是我们发送的消息回显，只更新状态，不重复添加
      const localMessage = this.pendingMessages.get(messageId)!;
      this.pendingMessages.delete(messageId);
      console.log('✅ 检测到自己发送的消息回显，已去重，messageId:', messageId);
      return;
    }
    
    // 是其他人发送的消息，正常添加
    const message: IChatHistory = {
      messageId: serverMessage.id || Date.now(),
      conversationId: serverMessage.conversationId,
      msg: serverMessage.msg,
      sender: processSenderAvatar(serverMessage.sender), // 使用头像工具处理头像
      create_at: serverMessage.create_at
    };
    
    console.log('📩 添加其他人的消息:', message);
    this.chatStore.addMessage(conversationId, message);
  }

  /**
   * @description: 添加本地消息
   */
  private addLocalMessage(message: IChatHistory, messageId: string) {
    // 添加到待确认列表（使用发送时的 messageId 作为 key）
    this.pendingMessages.set(messageId, message);
    
    // 添加到消息列表
    this.chatStore.addMessage(message.conversationId, message);
    
    console.log('添加本地消息，messageId:', messageId, 'message:', message);
  }

  /**
   * @description: 发送到服务器
   */
  private async sendToServer(message: IChatHistory, messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 发送消息到服务器，传递自定义的 messageId
        WsManager.sendChatMessage({
          type: this.getMessageType(message.conversationId),
          body: {
            conversationId: message.conversationId,
            msg: message.msg,
          }
        }, messageId);
        
        console.log('发送消息到服务器，messageId:', messageId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @description: 构建消息内容
   */
  private buildMessageContent(content: any, type: MessageType) {
    switch (type) {
      case MessageType.TEXT: // 文本消息
        return {
          type: MessageType.TEXT,
          textMsg: { content },
          imageMsg: null
        };
      case MessageType.IMAGE: // 图片消息
        return {
          type: MessageType.IMAGE,
          textMsg: undefined,
          imageMsg: content
        };
      default:
        throw new Error(`Unsupported message type: ${type}`);
    }
  }

  /**
   * @description: 获取消息类型
   */
  private getMessageType(conversationId: string): string {
    return conversationId.includes('_') ? 'private_message_send' : 'group_message_send';
  }

  /**
   * @description: 重发失败消息
   */
  async resendMessage(messageId: string): Promise<void> {
    const message = this.pendingMessages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    try {
      await this.sendToServer(message, messageId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description: 清理待确认消息（页面卸载时调用）
   */
  cleanup() {
    this.pendingMessages.clear();
  }
}

// 导出单例实例
export const messageManager = MessageManager.getInstance(); 