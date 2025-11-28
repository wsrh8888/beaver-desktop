/**
 * 主进程通知渲染进程
 */
import type { TrayMenuItem } from './app'

export enum NotificationModule {
  /**
   * 群组通知
   */
  DATABASE_GROUP = 'database:group',
  /**
   * 好友通知
   */
  DATABASE_FRIEND = 'database:friend',
  /**
   * 用户通知
   */
  DATABASE_USER = 'database:user',
  /**
   * 聊天消息通知
   */
  DATABASE_CHAT = 'database:chat',
  /**
   * 应用生命周期状态通知
   * 简化的状态流：连接 -> 同步 -> 就绪
   */
  APP_LIFECYCLE = 'app:lifecycle',

  /**
   * 搜索结果通知到验证窗口
   */
  SEARCH_TO_VERIFY = 'search:to:verify',
  /**
   * 媒体查看器更新通知
   */
  MEDIA_VIEWER = 'media:viewer',
  /**
   * 表情通知
   */
  EMOJI = 'database:emoji',
}

export enum NotificationFriendCommand {
  /**
   * 好友更新
   */
  FRIEND_UPDATE = 'friendUpdate',
  /**
   * 好友验证更新
   */
  FRIEND_VALID_UPDATE = 'friendValidUpdate',

}

export enum NotificationGroupCommand {
  /**
   * 群组更新
   */
  GROUP_UPDATE = 'groupUpdate',
  /**
   * 群组成员更新
   */
  GROUP_MEMBER_UPDATE = 'groupMemberUpdate',
  /**
   * 群组验证更新
   */
  GROUP_VALID_UPDATE = 'groupValidUpdate',
}

export enum NotificationUserCommand {
  /**
   * 用户更新
   */
  USER_UPDATE = 'userUpdate',
}

export enum NotificationSearchToVerifyCommand {
  SEARCH_TO_VERIFY = 'searchToVerify',
}

export enum NotificationChatCommand {
  /**
   * 会话表更新 - conversations表有变更
   */
  CONVERSATION_UPDATE = 'conversationUpdate',
  /**
   * 消息表更新 - messages表有变更
   */
  MESSAGE_UPDATE = 'messageUpdate',
  /**
   * 用户会话设置表更新 - user_conversations表有变更
   */
  USER_CONVERSATION_UPDATE = 'userConversationUpdate',
}

export enum NotificationEmojiCommand {
  /**
   * 表情更新
   */
  EMOJI_UPDATE = 'emojiUpdate',
  /**
   * 表情收藏更新
   */
  EMOJI_COLLECT_UPDATE = 'emojiCollectUpdate',
  /**
   * 表情包收藏更新
   */
  EMOJI_PACKAGE_COLLECT_UPDATE = 'emojiPackageCollectUpdate',
  /**
   * 表情包更新
   */
  EMOJI_PACKAGE_UPDATE = 'emojiPackageUpdate',
  /**
   * 表情包内容更新
   */
  EMOJI_PACKAGE_CONTENT_UPDATE = 'emojiPackageContentUpdate',
}

export enum NotificationAppLifecycleCommand {
  /**
   * 应用生命周期状态变更 - 统一的状态变更通知
   * data: {
   *   status: AppLifecycleStatus,
   *   progress?: number // 0-100，仅在syncing状态使用
   * }
   */
  STATUS_CHANGE = 'statusChange',
}

export enum NotificationMediaViewerCommand {
  /**
   * 更新图片查看器
   * data: { url: string, list?: string[], index?: number }
   */
  UPDATE_IMAGE = 'updateImage',
  /**
   * 更新视频播放器
   * data: { url: string, title?: string }
   */
  UPDATE_VIDEO = 'updateVideo',
  /**
   * 更新音频播放器
   * data: { url: string, title?: string }
   */
  UPDATE_AUDIO = 'updateAudio',
}

/**
 * 应用生命周期状态
 * 细化的IM状态流：连接 -> 同步 -> 就绪，支持不同类型的错误
 */
export type AppLifecycleStatus
  = | 'connecting' // WebSocket连接中
    | 'syncing' // 数据同步中
    | 'ready' // 应用就绪（隐藏状态条）
    | 'connect_error' // WebSocket连接错误/断开
    | 'sync_error' // 数据同步错误

/**
 * 主进程更新通知渲染进程
 */
export interface NotificationCommandMap {
  [NotificationModule.DATABASE_FRIEND]: NotificationFriendCommand
  [NotificationModule.DATABASE_USER]: NotificationUserCommand
  [NotificationModule.DATABASE_GROUP]: NotificationGroupCommand
  [NotificationModule.DATABASE_CHAT]: NotificationChatCommand
  [NotificationModule.APP_LIFECYCLE]: NotificationAppLifecycleCommand
  [NotificationModule.SEARCH_TO_VERIFY]: NotificationSearchToVerifyCommand
  [NotificationModule.MEDIA_VIEWER]: NotificationMediaViewerCommand
}

export interface INotificationPayload<M extends NotificationModule> {
  command: NotificationCommandMap[M]
  data?: any
}

export interface SystemNotificationOptions {
  /**
   * @description: 通知标题
   */
  title: string
  /**
   * @description: 通知内容
   */
  body: string
  /**
   * @description: 通知图标
   */
  icon?: string
  /**
   * @description: 是否静默通知
   */
  silent?: boolean
}

export interface TrayUpdateOptions {
  /**
   * @description: 托盘菜单项列表，用于更新或添加消息项
   */
  menuItems?: TrayMenuItem[]
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
  /**
   * 显示系统通知
   */
  showSystemNotification(options: SystemNotificationOptions): void
  /**
   * 更新托盘菜单项列表
   * @param options 托盘更新选项，可以添加或更新消息项
   */
  updateTray(options: TrayUpdateOptions): void
  /**
   * 删除托盘菜单项
   * @param id 要删除的消息项 ID
   */
  deleteTrayItem(id: string): void
}
