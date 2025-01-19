
export enum IEvent {
  /**
   * @description: 发送消息到主进程
   */  
  RenderToMainMsg = 'render-to-main-msg', 

  /**
   * @description: 发送同步消息到主进程
   */
  RenderToMainSyncMsg = 'render-to-main-msg-sync', // 同步消息

  /**
   * @description: 小程序消息发送消息到主进程
   */
  AppToMainMsg = 'app-to-main-msg',

  /**
   * @description: 小程序消息同步到主进程
   */
  AppToMainSyncMsg = 'app-to-main-msg-sync',


}


