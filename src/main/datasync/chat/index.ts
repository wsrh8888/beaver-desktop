import datasyncModule from './conversation-meta'
import conversationSettingModule from './user-conversation'

export const chatDatasync = new class chatDatasync {
  async checkAndSync() {
    // 优化同步顺序：先同步用户会话关系，再同步会话元数据（会自动触发消息同步）
    // 这样确保会话元数据和消息数据的一致性
    await conversationSettingModule.checkAndSync() // 1. 用户会话关系
    await datasyncModule.checkAndSync() // 2. 会话元数据 + 消息（通过调用 messageSyncModule）
  }
}()
