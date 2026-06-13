import messageSync from './chat-message'
import conversationMetaSync from './conversation-meta'
import messageMediaSync from './message-media'
import userConversationSync from './user-conversation'

// 聊天数据同步统一入口
export const chatDatasync = new class ChatDatasync {
  async checkAndSync() {
    await Promise.all([
      userConversationSync.checkAndSync(),
      conversationMetaSync.checkAndSync(),
      messageSync.checkAndSync(),
      messageMediaSync.checkAndSync(),
    ])
  }
}()
