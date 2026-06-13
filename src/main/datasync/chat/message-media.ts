import { datasyncGetSyncMessageMediasApi } from 'mainModule/api/datasync'
import messageMediaBusiness from 'mainModule/business/chat/message-media'
import dbServiceDataSync from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-message-media')

class MessageMediaSync {
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      const localCursor = await dbServiceDataSync.get({ module: 'chat_message_medias' })
      const lastSyncTime = localCursor?.updatedAt || 0

      const serverResponse = await datasyncGetSyncMessageMediasApi({ since: lastSyncTime })
      const messageIds = serverResponse.result.messageIds || []

      if (messageIds.length > 0)
        await messageMediaBusiness.batchSave(userId, messageIds)

      await dbServiceDataSync.upsert({
        module: 'chat_message_medias',
        version: -1,
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => {})
    }
    catch (error) {
      logger.error({ text: '消息媒体状态同步失败', data: { error: (error as any)?.message } })
    }
  }
}

export default new MessageMediaSync()
