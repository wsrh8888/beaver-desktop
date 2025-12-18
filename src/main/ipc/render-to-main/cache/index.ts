import { CacheCommand } from 'commonModule/type/ipc/command'
import cacheManager from 'mainModule/cache'
// import { FileCacheManager } from 'mainModule/cache/manager'
import logger from 'mainModule/utils/log'

/**
 * 缓存IPC处理器 - 清晰的方法分离
 */
class CacheHandler {
  /**
   * 处理缓存相关命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: CacheCommand, data: any): Promise<any> {
    try {
      switch (command) {
        case CacheCommand.GET:
          return await cacheManager.get(data.type, data.fileKey)
        case CacheCommand.SET:
          return await cacheManager.add(data.type, data.fileKey)
        default:
          logger.error({ text: `缓存处理未知命令: ${command}` }, 'CacheHandler')
          return null
      }
    }
    catch (error) {
      logger.error({ text: '缓存处理异常', data: (error as any)?.message || error }, 'CacheHandler')
      throw error
    }
  }
}
