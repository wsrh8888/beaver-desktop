import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { dataSyncManager } from 'mainModule/datasync/manager'
// import logger from 'mainModule/utils/log'

// const loggerName = 'datasync-handler'
// 数据同步处理器 - 简化版
export class DataSyncHandler {
  // 处理IPC命令
  static async handle(command: DataSyncCommand, _data: any = {}): Promise<any> {
    switch (command) {
      case DataSyncCommand.INITIALIZE:
        await dataSyncManager.autoSync()
        break
      default:
        return null
    }
  }
}
