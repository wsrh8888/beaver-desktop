import { getCurrentConfig } from 'commonModule/config'
import { ConfigCommand } from 'commonModule/type/ipc/command'

class ConfigHandler {
  /**
   * 统一的配置处理入口
   */
  handle(event: Electron.IpcMainEvent, command: ConfigCommand, _data: any) {
    switch (command) {
      case ConfigCommand.GET:
        event.returnValue = getCurrentConfig()
        break
      default:
        console.error(`日志处理未知命令: ${command}`)
    }
  }
}

export default new ConfigHandler()
