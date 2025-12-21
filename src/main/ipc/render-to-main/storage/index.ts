import type { RenderCommand } from 'commonModule/type/ipc/command'
import type { IStoreOptions } from 'commonModule/type/mainStore'
import { StorageCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'

class StorageHandler {
  /**
   * 统一的存储处理入口（同步）
   */
  handle(_event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: StorageCommand | RenderCommand, data: any): any {
    switch (command) {
      case StorageCommand.GET:
        return this.handleGet(data)
      case StorageCommand.SET:
        return this.handleSet(data)
      case StorageCommand.REMOVE:
        return this.handleRemove(data)
      default:
        console.error(`存储处理未知命令: ${command}`)
        return null
    }
  }

  /**
   * 获取存储数据
   */
  private handleGet(data: { key: string }): any {
    return store.get(data.key)
  }

  /**
   * 设置存储数据
   */
  private handleSet(data: { key: string, value: any, options?: IStoreOptions }): void {
    store.set(data.key, data.value, data.options)
  }

  /**
   * 删除存储数据
   */
  private handleRemove(data: { key: string, options?: IStoreOptions }): void {
    store.delete(data.key, data.options)
  }
}

export default new StorageHandler()
