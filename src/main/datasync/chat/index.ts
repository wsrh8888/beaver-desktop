import messageSyncModule from './chat-message'
import datasyncModule from './conversation-meta'
import conversationSettingModule from './user-conversation'

export const chatDatasync = new class chatDatasync {
  async checkAndSync() {
    await datasyncModule.checkAndSync()
    await messageSyncModule.checkAndSync()
    await conversationSettingModule.checkAndSync()
  }
}()
