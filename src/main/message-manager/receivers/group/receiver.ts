import { BaseReceiver } from '../../base/base-receiver'

/**
 * 群组操作数据接口
 */
interface GroupOperationData {
  operation: string
  groupId: string
  userId: string
  data?: any
  timestamp: number
}

/**
 * @description: 群组操作接收器 - 主进程版本
 */
export class GroupReceiver extends BaseReceiver<GroupOperationData> {
  protected readonly receiverName = 'GroupReceiver'

  constructor() {
    // 群组操作的批处理参数
    super({
      batchSize: 5, // 群组操作较少
      delayMs: 100, // 快速响应
    })
  }

  /**
   * 处理单个群组操作
   */
  protected async processMessage(operationData: GroupOperationData): Promise<void> {
    // TODO: 实现群组操作处理逻辑
    // 1. 保存到本地数据库
    // 2. 通知渲染进程更新UI

    // 示例实现
    console.log('处理群组操作:', operationData.operation, operationData.groupId)
  }

  /**
   * 批量处理群组操作
   */
  protected async processBatchMessages(messages: GroupOperationData[]): Promise<void> {
    // TODO: 实现批量群组操作处理
    // 可以批量更新数据库，或调用批量API

    // 示例实现
    console.log(`批量处理 ${messages.length} 个群组操作`)

    // 如果不需要真正的批量处理，可以逐个处理
    for (const operationData of messages) {
      await this.processMessage(operationData)
    }
  }

  /**
   * 兼容旧接口
   */
  handleGroupOperation(wsMessage: any) {
    // 调用基类的 handle 方法
    this.handle({
      messageId: `group_op_${wsMessage.content?.data?.operation}_${Date.now()}`,
      data: {
        operation: wsMessage.content?.data?.operation,
        groupId: wsMessage.content?.data?.groupId,
        userId: wsMessage.content?.data?.userId,
        data: wsMessage.content?.data,
        timestamp: Date.now(),
      },
    })
  }
}
