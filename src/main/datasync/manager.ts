import { NotificationDataSyncCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import { friendDatasync } from './friend'

// 数据同步管理器
export class DataSyncManager {
  constructor() {
    // 不需要初始化，直接使用导出的实例
  }

  // 自动同步
  async autoSync() {
    logger.info({ text: '开始自动同步' }, 'DataSyncManager')
    // 通知渲染进程：同步开始
    sendMainNotification('*', NotificationModule.DATABASE_DATASYNC, NotificationDataSyncCommand.DATABASE_DATASYNC_START)

    try {
      // await userDatasync.checkAndSync()
      // await chatDatasync.checkAndSync()
      await friendDatasync.checkAndSync()
      // await groupDatasync.checkAndSync()

      // 通知渲染进程：同步完成
      sendMainNotification('*', NotificationModule.DATABASE_DATASYNC, NotificationDataSyncCommand.DATABASE_DATASYNC_COMPLETE)
    }
    catch (error) {
      // 通知渲染进程：同步失败
      sendMainNotification('*', NotificationModule.DATABASE_DATASYNC, NotificationDataSyncCommand.DATABASE_DATASYNC_ERROR, {
        message: '数据同步失败',
        error: (error as any)?.message,
      })

      throw error
    }
  }
}

// 导出数据同步管理器实例
export const dataSyncManager = new DataSyncManager()
