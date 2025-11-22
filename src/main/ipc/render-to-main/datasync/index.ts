import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { dataSyncManager } from 'mainModule/datasync/manager'
import wsManager from 'mainModule/ws-manager'
// 数据同步处理器
export class DataSyncHandler {
  // 处理IPC命令
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataSyncCommand, _data: any = {}): Promise<any> {
    console.log('11111111111111111111111111', command, _data)
    switch (command) {
      case DataSyncCommand.MANUAL_SYNC:
        await dataSyncManager.autoSync()
        return { success: true }
      case DataSyncCommand.GET_APP_LIFECYCLE_STATUS:
        return await this.getAppLifecycleStatus()
      default:
        return null
    }
  }

  // 获取应用生命周期初始状态
  private static async getAppLifecycleStatus(): Promise<{ status: string }> {
    const wsStatus = wsManager.getStatus()
    const dataSyncStatus = dataSyncManager.getStatus()

    // 根据WebSocket和数据同步状态确定应用状态
    let appStatus: string
    switch (wsStatus) {
      case 'connecting':
        appStatus = 'connecting'
        break
      case 'connected':
        // WebSocket连接成功，根据数据同步状态确定
        appStatus = dataSyncStatus === 'syncing' ? 'syncing' : 'ready'
        break
      case 'error':
        appStatus = 'connect_error'
        break
      case 'closed':
      default:
        appStatus = 'connecting'
        break
    }

    return { status: appStatus }
  }
}
