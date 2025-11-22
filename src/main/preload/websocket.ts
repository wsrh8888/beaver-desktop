import type { IWebSocketModule } from 'commonModule/type/preload/websocket'
import { WebSocketCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'
import { GetWsMessageBody, WsCommand, WsType } from 'commonModule/type/ws/command'

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
    privateMessageSend: async (
      wsMessage: any
    ): Promise<boolean> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.SEND_CHAT_MESSAGE, {
        command: WsType.PRIVATE_MESSAGE_SEND,
        data: wsMessage,
      })
    },
    groupMessageSend: async <T extends WsType>(
      conversationId: string,
      content: GetWsMessageBody<T>
    ): Promise<boolean> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WebSocketCommand.SEND_CHAT_MESSAGE, {
        command: WsType.GROUP_MESSAGE_SEND,
        data: {
          conversationId,
          content,
        },
      })
    },
  },
}
