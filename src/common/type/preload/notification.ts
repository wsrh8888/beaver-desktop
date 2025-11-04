export enum NotificationModule {
  DATABASE_FRIEND = 'database:friend',
  DATABASE_USER = 'database:user',
  /**
   * 数据同步状态通知
   */
  DATABASE_DATASYNC = 'database:datasync',
  /**
   * 聊天消息通知
   */
  DATABASE_CHAT = 'database:chat',
  /**
   * 连接状态通知
   */
  CONNECTION = 'connection',
  /**
   * 搜索结果通知到验证窗口
   */
  SEARCH_TO_VERIFY = 'search:to:verify',
}

export enum NotificationFriendCommand {
  GET_FRIENDS = 'getFriends',
  GET_VALID_LIST = 'getValidList',
}

export enum NotificationUserCommand {
  GET_USER_INFO = 'getUserInfo',
}

export enum NotificationDataSyncCommand {
  DATABASE_DATASYNC_START = 'database:datasync:start',
  DATABASE_DATASYNC_COMPLETE = 'database:datasync:complete',
  DATABASE_DATASYNC_ERROR = 'database:datasync:error',
}

export enum NotificationSearchToVerifyCommand {
  SEARCH_TO_VERIFY = 'searchToVerify',
}

export enum NotificationChatCommand {
  /**
   * 新消息通知 - 合并通知，避免频繁发送
   */
  NEW_MESSAGES = 'newMessages',
  /**
   * 消息状态更新
   */
  MESSAGE_STATUS_UPDATE = 'messageStatusUpdate',
}

export enum NotificationConnectionCommand {
  /**
   * 连接状态变更 - 统一的状态变更通知
   * data: { status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'ready' }
   */
  STATUS_CHANGE = 'statusChange',
}

export interface NotificationCommandMap {
  [NotificationModule.DATABASE_FRIEND]: NotificationFriendCommand
  [NotificationModule.DATABASE_USER]: NotificationUserCommand
  [NotificationModule.DATABASE_DATASYNC]: NotificationDataSyncCommand
  [NotificationModule.DATABASE_CHAT]: NotificationChatCommand
  [NotificationModule.CONNECTION]: NotificationConnectionCommand
  [NotificationModule.SEARCH_TO_VERIFY]: NotificationSearchToVerifyCommand
}

export interface INotificationPayload<M extends NotificationModule> {
  command: NotificationCommandMap[M]
  data?: any
}

export interface INotificationModule {
  on<M extends NotificationModule>(module: M, callback: (params: INotificationPayload<M>) => void): void
  off<M extends NotificationModule>(module: M, callback: (params: INotificationPayload<M>) => void): void
  send<M extends NotificationModule>(
    targetName: string,
    module: M,
    command: NotificationCommandMap[M],
    payload?: any
  ): void
}
