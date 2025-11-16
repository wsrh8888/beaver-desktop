import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import logger from 'mainModule/utils/log'
import { conversationBusiness } from 'mainModule/business/chat/conversation'

/**
 * 会话操作数据接口
 */
interface ConversationOperationData {
  operation: string
  conversationId: string
  data?: any
  timestamp: number
}

/**
 * @description: 会话接收器 - 处理conversations表的操作
 */
export class ConversationReceiver  {
  protected readonly receiverName = 'ConversationReceiver'

  constructor() {
    // 会话操作需要快速响应

  }

  /**
   * 批量处理会话操作
   */
  protected async processBatchMessages(messages: ConversationOperationData[]): Promise<void> {
    // 调用business层处理WS消息
    await conversationBusiness.handleWSConversationUpdates(messages)
  }

}
