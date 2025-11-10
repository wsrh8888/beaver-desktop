import logger from 'mainModule/utils/log'

/**
 * 批处理配置接口
 */
export interface BatchConfig {
  /** 批量大小 - 达到这个数量就立即处理 */
  batchSize?: number
  /** 延迟时间（毫秒）- 没有新消息到达这个时间后处理 */
  delayMs?: number
}

/**
 * @description: 消息接收器基类 - 强制所有接收器使用批量处理
 * @template T 消息数据类型
 */
export abstract class BaseReceiver<T = any> {
  /** 待处理的消息队列 */
  protected pendingMessages: T[] = []

  /** 处理定时器 */
  protected processingTimer: NodeJS.Timeout | null = null

  /** 批处理配置 */
  protected batchConfig: BatchConfig

  /** 接收器名称（用于日志） */
  protected abstract readonly receiverName: string

  constructor(batchConfig: BatchConfig = {}) {
    this.batchConfig = {
      batchSize: 50,
      delayMs: 500,
      ...batchConfig,
    }
  }

  /**
   * 主入口方法 - 处理接收到的消息（强制批量处理）
   */
  async handle(wsMessage: any): Promise<void> {
    try {
      console.log('处理ws模块发送回来的消息', JSON.stringify(wsMessage))
      // 预处理消息
      const processedMessage = await this.preProcessMessage(wsMessage)

      // 强制所有消息都进入批量队列
      this.addToBatchQueue(processedMessage)
    }
    catch (error) {
      logger.error({
        text: `${this.receiverName} - 处理失败`,
        data: {
          messageId: wsMessage.messageId,
          error: (error as Error).message,
        },
      }, this.receiverName)
    }
  }

  /**
   * 预处理消息（子类可重写）
   */
  protected async preProcessMessage(wsMessage: any): Promise<T> {
    return wsMessage.data as T
  }

  /**
   * 添加到批处理队列
   */
  private addToBatchQueue(message: T): void {
    this.pendingMessages.push(message)

    const { batchSize = 50, delayMs = 500 } = this.batchConfig

    // 如果队列满了，立即处理
    if (this.pendingMessages.length >= batchSize) {
      this.processBatch()
    }
    else if (!this.processingTimer) {
      // 如果没有定时器在运行，启动新的定时器
      // 在delayMs时间内的所有消息都会被累积在一起处理
      this.scheduleBatchProcessing(delayMs)
    }
    // 如果定时器已经在运行，继续累积消息，直到定时器到期
  }

  /**
   * 调度批处理
   */
  private scheduleBatchProcessing(delayMs: number): void {
    if (this.processingTimer)
      return

    this.processingTimer = setTimeout(() => {
      this.processBatch()
      this.processingTimer = null
    }, delayMs)
  }

  /**
   * 执行批处理
   */
  private async processBatch(): Promise<void> {
    if (this.pendingMessages.length === 0)
      return

    // 清除定时器
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }

    const messages = [...this.pendingMessages]
    this.pendingMessages = []

    try {
      await this.processBatchMessages(messages)
      this.notifyProcessed(messages)
    }
    catch (error) {
      logger.error({
        text: `${this.receiverName} - 批量处理失败`,
        data: { count: messages.length, error: (error as Error).message },
      }, this.receiverName)
    }
  }
  /**
   * 批量处理消息（子类必须实现真正的批量逻辑）
   */
  protected abstract processBatchMessages(messages: T[]): Promise<void>

  /**
   * 通知处理完成（子类可重写）
   */
  protected notifyProcessed(_messages: T[]): void {
    // 子类实现具体通知逻辑
  }

  /**
   * 销毁接收器
   */
  destroy(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }
    this.pendingMessages = []
  }
}
