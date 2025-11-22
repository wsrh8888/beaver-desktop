import { NotificationAppLifecycleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import { chatDatasync } from './chat'
import { friendDatasync } from './friend'
import { groupDatasync } from './group'
import { userDatasync } from './user'

// 数据同步管理器
export class DataSyncManager {
  constructor() {
    // 不需要初始化，直接使用导出的实例
  }

  // 自动同步
  async autoSync() {
    logger.info({ text: '开始自动同步' }, 'DataSyncManager')

    try {
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'syncing',
        timestamp: Date.now(),
      })
      await userDatasync.checkAndSync()
      await chatDatasync.checkAndSync()
      await friendDatasync.checkAndSync()
      await groupDatasync.checkAndSync()

      // 通知前端：同步完成，系统就绪
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'ready',
      })

      logger.info({ text: '数据同步完成' }, 'DataSyncManager')
    }
    catch {
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'sync_error',
      })
    }
  }
}

// 导出数据同步管理器实例
export const dataSyncManager = new DataSyncManager()
