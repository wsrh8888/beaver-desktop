import { WebSocketCommand } from 'commonModule/type/ipc/command'
import logger from 'mainModule/utils/log'
import wsManager from 'mainModule/ws-manager'
import { ChatHandler } from './chat'

const loggerName = 'websocket-handler'

export class WebSocketHandler {
  /**
   * 处理WebSocket相关的IPC命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: WebSocketCommand, data: any = {}): Promise<unknown> {
    logger.info({ text: '处理WebSocket命令', data: { command, data } }, loggerName)

    try {
      switch (command) {
        case WebSocketCommand.CONNECT:
          // WebSocket连接由wsManager直接处理，不涉及消息管理器
          await wsManager.connect()
          return true

        case WebSocketCommand.DISCONNECT:
          wsManager.disconnect()
          return true

        case WebSocketCommand.SEND_CHAT_MESSAGE:
          return await ChatHandler.handle(_event, data?.command, data?.data)
      }
    }
    catch (error) {
      logger.error({ text: 'WebSocket命令处理失败', data: { command, error } }, loggerName)
      throw error
    }
  }
}
