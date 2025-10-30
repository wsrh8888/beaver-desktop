import SearchToVerifyEventManager from './searchToVerify'

/**
 * @description: 事件中心
 */
class NotificationManager {
  init() {
    SearchToVerifyEventManager.init()
  }

  off() {
    SearchToVerifyEventManager.off()
  }
}

export default new NotificationManager()
