import { BaseReceiver } from '../../base/base-receiver'

/**
 * 好友操作数据接口
 */
interface FriendOperationData {
  operation: string
  friendId: string
  userId: string
  data?: any
  timestamp: number
}

/**
 * @description: 好友操作接收器 - 主进程版本
 */
export class FriendReceiver extends BaseReceiver<FriendOperationData> {
  protected readonly receiverName = 'FriendReceiver'

  constructor() {
    // 好友操作的批处理参数
    super({
      batchSize: 5, // 好友操作较少
      delayMs: 100, // 快速响应
    })
  }

  /**
   * 处理单个好友操作
   */
  protected async processMessage(operationData: FriendOperationData): Promise<void> {
    // TODO: 实现好友操作处理逻辑
    // 1. 保存到本地数据库
    // 2. 通知渲染进程更新UI

    // 示例实现
    console.log('处理好友操作:', operationData.operation, operationData.friendId)
  }

  /**
   * 批量处理好友操作
   */
  protected async processBatchMessages(messages: FriendOperationData[]): Promise<void> {
    // TODO: 实现批量好友操作处理
    // 可以批量更新数据库，或调用批量API

    // 示例实现
    console.log(`批量处理 ${messages.length} 个好友操作`)

    // 如果不需要真正的批量处理，可以逐个处理
    for (const operationData of messages) {
      await this.processMessage(operationData)
    }
  }

  /**
   * 兼容旧接口
   */
  handleFriendOperation(wsMessage: any) {
    // 调用基类的 handle 方法
    this.handle({
      messageId: `friend_op_${wsMessage.content?.data?.operation}_${Date.now()}`,
      data: {
        operation: wsMessage.content?.data?.operation,
        friendId: wsMessage.content?.data?.friendId,
        userId: wsMessage.content?.data?.userId,
        data: wsMessage.content?.data,
        timestamp: Date.now(),
      },
    })
  }
}
