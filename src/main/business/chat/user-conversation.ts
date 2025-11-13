import type {
  MarkAsReadReq,
  UpdateSettingsReq,
  GetConversationInfoReq
} from 'commonModule/type/business/chat/user-conversation'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'

/**
 * 用户会话业务逻辑
 * 对应 chat_user_conversations 表
 * 负责用户会话列表、未读消息、设置等业务逻辑
 */
export class UserConversationBusiness {

}

// 导出单例实例
export const userConversationBusiness = new UserConversationBusiness()
