import { NotificationAppLifecycleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { dataSyncManager } from 'mainModule/datasync/manager.ts'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import WsManager from 'mainModule/ws-manager/index'
import chatMessageRouter from './receivers/chat/inedx'
import emojiMessageRouter from './receivers/emoji/index'
import friendMessageRouter from './receivers/friend/index'
import groupMessageRouter from './receivers/group/index'
import notificationMessageRouter from './receivers/notification/index'
import userMessageRouter from './receivers/user/index'
import mcpMessageRouter from './receivers/mcp/index'
import callMessageRouter from './receivers/call/index'

/**
 * @description: 消息管理器 - 主进程版本，负责消息的发送、接收和状态管理
 */
class MessageManager {
  private isDataSyncing = false
  private messageQueue: any[] = []

  constructor() {

  }

  init() {
    // 设置 WebSocket 事件回调
    WsManager.setEventCallbacks({
      onMessage: this.handleWsMessage.bind(this),
      onConnecting: this.onWsConnecting.bind(this),
      onConnect: this.onWsConnect.bind(this),
      onDisconnect: this.onWsDisconnect.bind(this),
      onReconnectFailed: this.onWsReconnectFailed.bind(this),
      onError: this.onWsError.bind(this),
    })
  }

  /**
   * @description: WebSocket 开始连接回调
   */
  private onWsConnecting() {
    // 通知前端：开始连接
    sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
      status: 'connecting',
      timestamp: Date.now(),
    })

    logger.info({ text: 'WebSocket 开始连接' }, 'MessageManager')
  }

  /**
   * @description: WebSocket 连接成功回调
   */
  private async onWsConnect() {
    logger.info({ text: 'WebSocket 连接成功，开始数据同步' }, 'MessageManager')

    try {
      this.isDataSyncing = true

      // 通知前端：开始同步（跳过中间状态）

      // 开始数据同步，并等待同步完成
      await dataSyncManager.autoSync()
      this.isDataSyncing = false

      // 处理队列中的所有消息
      this.processMessageQueue()

      logger.info({ text: 'WebSocket 连接成功，消息管理器已准备就绪' }, 'MessageManager')
    }
    catch (error) {
      this.isDataSyncing = false

      // 通知前端：同步失败

      logger.error({ text: '数据同步失败', data: { error: (error as any)?.message } }, 'MessageManager')
    }
  }

  /**
   * @description: WebSocket 重连失败回调
   */
  private onWsReconnectFailed() {
    // 通知前端：连接失败（合并 disconnected 和 connect_error）
    sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
      status: 'connect_error',
      timestamp: Date.now(),
    })

    logger.info({ text: 'WebSocket 重连失败' }, 'MessageManager')
  }

  /**
   * @description: WebSocket 断开连接回调
   */
  private onWsDisconnect() {
    // 通知前端：开始重连
    sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
      status: 'connecting',
      timestamp: Date.now(),
    })

    logger.info({ text: 'WebSocket 断开连接，开始重连' }, 'MessageManager')
  }

  /**
   * @description: WebSocket 错误回调
   */
  private onWsError(error: any) {
    // 通知前端：连接错误
    sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
      status: 'connect_error',
      timestamp: Date.now(),
    })

    logger.error({ text: 'WebSocket 错误', data: { error } }, 'MessageManager')
  }

  /**
   * @description: 处理 WebSocket 消息
   * @param wsMessage WebSocket 消息
   */
  private handleWsMessage(wsMessage: any) {
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    console.log(JSON.parse(JSON.stringify(wsMessage)))

    // 如果正在数据同步，加入消息队列
    if (this.isDataSyncing) {
      this.messageQueue.push(wsMessage)
      return
    }

    // 正常处理消息
    this.processMessage(wsMessage, 'ws')
  }

  /**
   * @description: 处理消息队列中的所有消息
   */
  private processMessageQueue() {
    logger.info({ text: `开始处理队列中的 ${this.messageQueue.length} 条消息` }, 'MessageManager')

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      try {
        this.processMessage(message, 'queue')
        logger.info({ text: '队列消息处理完成', data: { command: message.command } }, 'MessageManager')
      }
      catch (error) {
        logger.error({
          text: '处理队列消息失败',
          data: {
            command: message.command,
            error: (error as any)?.message,
          },
        }, 'MessageManager')
      }
    }

    logger.info({ text: '队列消息处理完成' }, 'MessageManager')
  }

  /**
   * @description: 处理单个消息
   * @param wsMessage WebSocket 消息
   */
  private processMessage(wsMessage: any, source: 'ws' | 'queue') {
    console.log('处理消息', JSON.stringify(wsMessage), source)
    switch (wsMessage.command) {
      case 'CHAT_MESSAGE':
        chatMessageRouter.processChatMessage(wsMessage.content)
        break
      case 'FRIEND_OPERATION':
        friendMessageRouter.processFriendMessage(wsMessage.content)
        break
      case 'GROUP_OPERATION':
        groupMessageRouter.processGroupMessage(wsMessage.content)
        break
      case 'NOTIFICATION':
        notificationMessageRouter.processNotificationMessage(wsMessage.content)
        break
      case 'EMOJI':
        emojiMessageRouter.processEmojiMessage(wsMessage.content)
        break
      case 'USER_PROFILE':
        userMessageRouter.processUserMessage(wsMessage.content)
        break
      case 'MCP_OPERATION':
        mcpMessageRouter.processMCPMessage(wsMessage.content)
        break
      case 'CALL':
        callMessageRouter.processCallMessage(wsMessage.content)
        break
      case 'HEARTBEAT':
        break
      default:
        logger.warn({ text: '未处理的消息类型', data: { command: wsMessage.command } }, 'MessageManager')
    }
  }
}

export default new MessageManager()
