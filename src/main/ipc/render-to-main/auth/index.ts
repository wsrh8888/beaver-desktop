import { AuthCommand } from 'commonModule/type/ipc/command'
import { BrowserWindow } from 'electron'
import AppApplication from 'mainModule/application/app'
import LoginApplication from 'mainModule/application/login'
import cacheManager from 'mainModule/cache'
import dbManager from 'mainModule/database/db'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import wsManager from 'mainModule/ws-manager'

export class AuthHandler {
  /**
   * 统一的认证处理入口
   */
  static async handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: AuthCommand, _data: any) {
    switch (command) {
      case AuthCommand.LOGIN:
        await this.handleLogin()
        break
      case AuthCommand.LOGOUT:
        await this.handleLogout()
        break
      default:
        console.error(`认证处理未知命令: ${command}`)
    }
  }

  /**
   * 处理登录
   */
  public static async handleLogin() {
    try {
      logger.info({ text: '开始登录流程' }, 'AuthHandler')

      // 初始化文件缓存
      cacheManager.init()
      // 1. 关闭所有的窗口
      this.closeAllWindows()
      const userInfo = store.get('userInfo')

      // 3. 初始化用户缓存
      if (userInfo?.userId) {
        await cacheManager.init(userInfo.userId)

        dbManager.init(userInfo?.userId)
        logger.info({ text: '用户缓存初始化完成' }, 'AuthHandler')
      }

      // 4. 打开app主窗口
      AppApplication.createBrowserWindow()

      // 5. 在后台建立ws连接 (不阻塞UI显示)
      wsManager.connect()

      logger.info({ text: '开始后台数据同步' }, 'AuthHandler')

      logger.info({ text: '登录流程完成，窗口已显示' }, 'AuthHandler')
    }
    catch (error) {
      logger.error({ text: '登录流程失败', data: error }, 'AuthHandler')
      throw error
    }
  }

  /**
   * 处理登出
   */
  public static async handleLogout() {
    try {
      logger.info({ text: '开始登出流程' }, 'AuthHandler')
      // cache初始化

      // 1. 清空store的所有数据
      store.clearAll()
      logger.info({ text: 'Store数据已清空' }, 'AuthHandler')

      // 2. 关闭所有的窗口
      this.closeAllWindows()

      // 3. 打开login窗口
      LoginApplication.createBrowserWindow()

      // 4. 关闭ws连接
      wsManager.disconnect()
      logger.info({ text: 'WebSocket连接已关闭' }, 'AuthHandler')

      // 5. 关闭数据库连接
      dbManager.close()
      logger.info({ text: '数据库连接已关闭' }, 'AuthHandler')

      logger.info({ text: '登出流程完成' }, 'AuthHandler')
    }
    catch (error) {
      logger.error({ text: '登出流程失败', data: error }, 'AuthHandler')
      throw error
    }
  }

  /**
   * 关闭所有窗口
   */
  private static closeAllWindows() {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close()
      }
    })
    logger.info({ text: `已关闭 ${windows.length} 个窗口` }, 'AuthHandler')
  }
}
