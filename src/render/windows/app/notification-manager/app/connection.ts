import { useAppStore } from '../../pinia/app/app'
import Logger from 'renderModule/utils/logger'

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
      data: data,
    })

    const appStore = useAppStore()
    appStore.updateLifecycleStatus(data.status, data.progress)
  }
}

export default new AppLifecycleNotificationManager()
