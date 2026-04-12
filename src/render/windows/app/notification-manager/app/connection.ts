import Logger from 'renderModule/utils/logger'
import { useAppStore } from '../../pinia/app/app'

const logger = new Logger('应用生命周期通知处理器')

/**
 * @description: 应用生命周期通知处理器
 */
class AppLifecycleNotificationManager {
  /**
   * 处理生命周期状态变更
   */
  async handleLifecycleStatusChange(data: any) {
    logger.info({
      text: '处理应用生命周期状态变更',
      data,
    })

    const appStore = useAppStore()
    const oldStatus = appStore.lifecycleStatus
    appStore.updateLifecycleStatus(data.status)

    // 如果状态从 syncing 变更为 ready，说明全量增量同步已完成，需要重新加载本地 Store 数据
    if (data.status === 'ready' && oldStatus === 'syncing') {
      logger.info({ text: '同步完成，开始从本地数据库刷新 Store 数据' })
      await appStore.loadAllStoreData()
    }
  }
}

export default new AppLifecycleNotificationManager()
