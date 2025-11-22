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
    appStore.updateLifecycleStatus(data.status)
  }
}

export default new AppLifecycleNotificationManager()
