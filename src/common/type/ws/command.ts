export enum WsCommand {
  /**
   * @description: 聊天消息类
   */  
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  /**
   * @description: 好友关系类
   */  
  FRIEND_OPERATION = 'FRIEND_OPERATION',
  /**
   * @description: 群组操作类
   */  
  GROUP_OPERATION = 'GROUP_OPERATION',
  /**
   * @description: 用户信息类
   */  
  USER_PROFILE = 'USER_PROFILE',
  /**
   * @description: 消息同步类
   */  
  MESSAGE_SYNC = 'MESSAGE_SYNC',
  /**
   * @description: 心跳消息
   */
  HEARTBEAT = 'HEARTBEAT',
  /**
   * @description: 通用更新消息 (兼容性保留)
   */
  UPDATE_MESSAGE = 'COMMON_UPDATE_MESSAGE',
}

export interface IWsMessage {
  code: number;
  command: WsCommand;
  content: {
    timestamp: number;
    data: {
      type: string;
      body: {
        messageId: number;
        conversationId: string;
        msg: {
          type: number;
          textMsg?: {
            content: string;
          };
          imageMsg?: {
            src: string;
          } | null;
        };
        sender: {
          userId: string;
          avatar: string;
          nickname: string;
        };
        create_at: string;
        msgPreview?: string;
      };
    };
  };
}

export interface IWsConfig {
  url: string;
  token: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface IWsError {
  code: number;
  message: string;
  timestamp: number;
} 