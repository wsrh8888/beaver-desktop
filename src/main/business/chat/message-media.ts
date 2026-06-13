import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import dbServiceChatMessageMedia from 'mainModule/database/services/chat/message-media'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'

class MessageMediaBusiness {
  async batchSave(userId: string, messageIds: string[]) {
    if (!userId || messageIds.length === 0)
      return

    const now = Math.floor(Date.now() / 1000)
    await dbServiceChatMessageMedia.batchCreate({
      records: messageIds.map(messageId => ({
        userId,
        messageId,
        version: 0,
        createdAt: now,
      })),
    })

    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_MEDIA_UPDATE, {
      messageIds,
    })
  }

  async handleTableUpdates(userId: string, messageIds: string[]) {
    const currentUserId = store.get('userInfo')?.userId
    if (!currentUserId || userId !== currentUserId || messageIds.length === 0)
      return

    await this.batchSave(userId, messageIds)
  }
}

export default new MessageMediaBusiness()
