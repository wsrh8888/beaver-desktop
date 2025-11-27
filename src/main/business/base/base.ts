import logger from 'mainModule/utils/log'

/**
 * 业务批处理配置接口
 */
export interface BusinessBatchConfig {
  /** 队列大小限制 - 达到这个数量就立即处理 */
  queueSizeLimit?: number
  /** 延迟时间（毫秒）- 没有新请求到达这个时间后处理 */
  delayMs?: number
}

/**
 * 队列项接口
 */
export interface QueueItem {
  /** 唯一标识符 */
  key: string
  /** 请求数据 */
  data: any
  /** 时间戳 */
  timestamp: number
}

/**
 * @description: 业务层基类 - 支持队列聚合和批量处理
 * @template T 队列项类型
 */
export abstract class BaseBusiness<T extends QueueItem = QueueItem> {
  /** 待处理的请求队列 */
  protected pendingQueue: T[] = []

  /** 处理定时器 */
  protected processingTimer: NodeJS.Timeout | null = null

  /** 批处理配置 */
  protected batchConfig: BusinessBatchConfig

  /** 业务名称（用于日志） */
  protected abstract readonly businessName: string

  constructor(batchConfig: BusinessBatchConfig = {}) {
    this.batchConfig = {
      queueSizeLimit: 50,
      delayMs: 1000, // 1秒聚合
      ...batchConfig,
    }
  }

  /**
   * 添加请求到队列
   */
  protected addToQueue(item: T): void {
    this.pendingQueue.push(item)

    const { queueSizeLimit = 50, delayMs = 1000 } = this.batchConfig

    // 如果队列满了，立即处理
    if (this.pendingQueue.length >= queueSizeLimit) {
      this.processQueue()
    }
    else if (!this.processingTimer) {
      // 如果没有定时器在运行，启动新的定时器
      this.scheduleProcessing(delayMs)
    }
    // 如果定时器已经在运行，继续累积请求，直到定时器到期
  }

  /**
   * 调度队列处理
   */
  private scheduleProcessing(delayMs: number): void {
    if (this.processingTimer)
      return

    this.processingTimer = setTimeout(() => {
      this.processQueue()
    }, delayMs)
  }

  /**
   * 处理队列中的所有请求
   */
  private async processQueue(): Promise<void> {
    if (this.pendingQueue.length === 0)
      return

    // 清除定时器
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }

    const items = [...this.pendingQueue]
    this.pendingQueue = []

    try {
      await this.processBatchRequests(items)
    }
    catch (error) {
      logger.error({
        text: `${this.businessName} - 批量处理失败`,
        data: { count: items.length, error: (error as Error).message },
      }, this.businessName)
    }
  }

  /**
   * 批量处理请求（子类必须实现真正的批量逻辑）
   */
  protected abstract processBatchRequests(items: T[]): Promise<void>

  /**
   * 销毁业务对象，清理资源
   */
  destroy(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }
    this.pendingQueue = []
  }

  /**
   * 获取队列状态（用于调试）
   */
  getQueueStatus() {
    return {
      queueLength: this.pendingQueue.length,
      hasTimer: !!this.processingTimer,
      businessName: this.businessName,
    }
  }
}
