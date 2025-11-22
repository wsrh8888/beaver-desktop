import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { dataSyncManager } from 'mainModule/datasync/manager'

// 数据同步处理器
export class DataSyncHandler {
  // 处理IPC命令
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataSyncCommand, _data: any = {}): Promise<any> {
    console.log('11111111111111111111111111', command, _data)
    switch (command) {
      case DataSyncCommand.MANUAL_SYNC:
        await dataSyncManager.autoSync()
        return { success: true }
      default:
        return null
    }
  }
}
