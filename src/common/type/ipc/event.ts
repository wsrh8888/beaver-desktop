export enum IEvent {
  /**
   * @description: 发送消息到主进程
   */
  RenderToMain = 'render-to-main-msg',

  /**
   * @description: 发送同步消息到主进程
   */
  RenderToMainSyncMsg = 'render-to-main-msg-sync', // 同步消息
}
