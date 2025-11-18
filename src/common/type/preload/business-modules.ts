/**
 * @description: 用户模块接口
 */
export interface IUserModule {
  getUserInfo(): Promise<any>
  onInfoUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 好友模块接口
 */
export interface IFriendModule {
  getFriends(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 群组模块接口
 */
export interface IGroupModule {
  getGroups(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 会话模块接口
 */
export interface IConversationModule {
  getConversations(pagination?: any): Promise<any>
  onListUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}

/**
 * @description: 消息模块接口
 */
export interface IMessageModule {
  getChatMessages(conversationId: string, pagination?: any): Promise<any>
  sendMessage(conversationId: string, content: string, messageType: number): Promise<boolean>
  onNewMessage(callback: (data: any) => void): void
  removeNewMessageListener(callback: (data: any) => void): void
  onStatusUpdated(callback: (data: any) => void): void
  removeStatusListener(callback: (data: any) => void): void
}

/**
 * @description: 数据同步模块接口
 */
export interface ISyncModule {
  onStatusUpdated(callback: (data: any) => void): void
  removeListener(callback: (data: any) => void): void
}
