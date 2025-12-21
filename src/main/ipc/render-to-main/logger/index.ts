import type loggerModule from 'mainModule/utils/log'
import { LoggerCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'

class LoggerHandler {
  /**
   * 统一的日志处理入口
   */
  handle(event: Electron.IpcMainEvent, command: LoggerCommand, data: any) {
    switch (command) {
      case LoggerCommand.LOG:
        this.handleLog(data)
        break
      default:
        console.error(`日志处理未知命令: ${command}`)
    }
  }

  /**
   * 处理日志记录
   */
  private handleLog(data: any) {
    const { level, message, moduleName } = data
    logger[level as keyof typeof loggerModule](message, moduleName, 'render')
  }
}

export default new LoggerHandler()
