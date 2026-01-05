import MomentEventManager from './moment'

/**
 * @description: 事件中心
 */
class NotificationManager {
  init() {
    MomentEventManager.init()
  }

  off() {
    MomentEventManager.off()
  }
}

export default new NotificationManager()