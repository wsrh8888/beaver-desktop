import messageMediaBusiness from 'mainModule/business/chat/message-media'

class MessageMediaReceiver {
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody
    const updates = tableUpdates.filter((update: any) => update.table === 'message_medias')

    for (const update of updates) {
      for (const dataItem of update.data) {
        const messageIds = dataItem?.messageIds
        if (update.userId && Array.isArray(messageIds) && messageIds.length > 0)
          await messageMediaBusiness.handleTableUpdates(update.userId, messageIds)
      }
    }
  }
}

export default new MessageMediaReceiver()
