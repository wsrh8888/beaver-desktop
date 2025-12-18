import type { NetworkCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'

class NetworkHandler {
  /**
   * 统一的网络和配置处理入口
   */
  async handle(event: Electron.IpcMainEvent, command: NetworkCommand, _data: any): Promise<unknown> {
    // switch (command) {

    //   // default:
    //   //   console.error(`网络处理未知命令: ${command}`)
    //   //   return null
    // }
    logger.info({ text: '网络处理命令', data: { command, event } })
    return null
  }
}

export default new NetworkHandler()
