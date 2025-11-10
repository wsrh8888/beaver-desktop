import messageSync from './chat-message'

// 聊天数据同步统一入口
export const chatDatasync = new class ChatDatasync {
  async checkAndSync() {
    // 并行执行聊天相关同步器
    await Promise.all([
      // userConversationSync.checkAndSync(), // 用户会话设置同步
      // conversationMetaSync.checkAndSync(), // 会话元数据同步
      messageSync.checkAndSync(), // 消息同步
    ])
  }
}()
