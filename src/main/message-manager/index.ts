import { NotificationConnectionCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { dataSyncManager } from 'mainModule/datasync/manager.ts'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import WsManager from 'mainModule/ws-manager/index'
import { ConversationReceiver } from './receivers/chat/conversation-receiver'
import { MessageReceiver } from './receivers/chat/message-receiver'
import { UserConversationReceiver } from './receivers/chat/user-conversation-receiver'
import { FriendReceiver } from './receivers/friend/receiver'
import { GroupReceiver } from './receivers/group/receiver'
import { UserReceiver } from './receivers/user/receiver'

/**
 * @description: 消息管理器 - 主进程版本，负责消息的发送、接收和状态管理
 */
class MessageManager {
  public messageReceiver = new MessageReceiver()
  public conversationReceiver = new ConversationReceiver()
  public userConversationReceiver = new UserConversationReceiver()
  public friendReceiver = new FriendReceiver()
  public groupReceiver = new GroupReceiver()
  public userReceiver = new UserReceiver()
  private isDataSyncing = false
  private messageQueue: any[] = []

  constructor() {

  }

  init() {
    // 设置 WebSocket 事件回调
    WsManager.setEventCallbacks({
      onMessage: this.handleWsMessage.bind(this),
      onConnect: this.onWsConnect.bind(this),
      onDisconnect: this.onWsDisconnect.bind(this),
      onError: this.onWsError.bind(this),
    })
  }

  /**
   * @description: WebSocket 连接成功回调
   */
  private async onWsConnect() {
    logger.info({ text: 'WebSocket 连接成功，开始数据同步' }, 'MessageManager')

    // 通知前端：连接成功
    sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
      status: 'connected',
      timestamp: Date.now(),
    })

    try {
      this.isDataSyncing = true

      // 通知前端：开始同步
      sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
        status: 'syncing',
        timestamp: Date.now(),
      })

      // 开始数据同步，并等待同步完成
      await dataSyncManager.autoSync()
      this.isDataSyncing = false

      // 处理队列中的所有消息
      this.processMessageQueue()

      // 通知前端：同步完成，系统就绪
      sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
        status: 'ready',
        timestamp: Date.now(),
        messageCount: this.messageQueue.length,
      })

      logger.info({ text: 'WebSocket 连接成功，消息管理器已准备就绪' }, 'MessageManager')
    }
    catch (error) {
      this.isDataSyncing = false

      // 通知前端：同步失败
      sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
        status: 'error',
        timestamp: Date.now(),
        error: (error as Error).message,
        reason: 'sync_failed',
      })

      logger.error({ text: '数据同步失败', data: { error: (error as any)?.message } }, 'MessageManager')
    }
  }

  /**
   * @description: WebSocket 断开连接回调
   */
  private onWsDisconnect() {
    // 通知前端：连接断开
    sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
      status: 'disconnected',
      timestamp: Date.now(),
    })

    logger.info({ text: 'WebSocket 断开连接' }, 'MessageManager')
  }

  /**
   * @description: WebSocket 错误回调
   */
  private onWsError(error: any) {
    // 通知前端：连接错误
    sendMainNotification('*', NotificationModule.CONNECTION, NotificationConnectionCommand.STATUS_CHANGE, {
      status: 'error',
      timestamp: Date.now(),
      error: error?.message || error,
      reason: 'connection_error',
    })

    logger.error({ text: 'WebSocket 错误', data: { error } }, 'MessageManager')
  }

  /**
   * @description: 处理 WebSocket 消息
   * @param wsMessage WebSocket 消息
   */
  private handleWsMessage(wsMessage: any) {
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
        this.messageReceiver.handle(wsMessage.content)
        break
      case 'FRIEND_OPERATION':
        this.friendReceiver.handleFriendOperation(wsMessage)
        break
      case 'GROUP_OPERATION':
        this.groupReceiver.handleGroupOperation(wsMessage)
        break
      case 'USER_PROFILE':
        this.userReceiver.handleUserProfile(wsMessage)
        break
      case 'HEARTBEAT':
        break
      default:
        logger.warn({ text: '未处理的消息类型', data: { command: wsMessage.command } }, 'MessageManager')
    }
  }
}

export default new MessageManager()
