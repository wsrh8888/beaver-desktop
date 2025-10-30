import logger from 'mainModule/utils/log'

/**
 * @description: 好友操作接收器 - 主进程版本
 */
export class FriendReceiver {
  /**
   * @description: 处理好友操作
   * @param {any} wsMessage - WebSocket消息
   */
  handleFriendOperation(wsMessage: any) {
    logger.info({ text: '处理好友操作', data: { operation: wsMessage.content?.data?.operation } }, 'FriendReceiver')

    // TODO: 实现好友操作处理逻辑
    // 1. 保存到本地数据库
    // 2. 通知渲染进程更新UI
  }
}
