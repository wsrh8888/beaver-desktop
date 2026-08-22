import type { IWebSocketModule } from 'commonModule/type/preload/websocket'
import { WebSocketCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'
import { WebsocketCommand } from 'commonModule/type/ipc/websocket'

export const websocketModule: IWebSocketModule = {
  // 连接WebSocket
  connect: async (userId: string, deviceId: string): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.CONNECT, { userId, deviceId })
  },

  // 断开WebSocket连接
  disconnect: async (): Promise<void> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.DISCONNECT)
  },

  // 重新连接WebSocket
  reconnect: async (): Promise<boolean> => {
    return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.RECONNECT)
  },

  chat: {
    sendMessage: async (data: any): Promise<boolean> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.SEND_CHAT_MESSAGE, {
        command: WebsocketCommand.MESSAGE_SEND,
        data,
      })
    },
  },
}
