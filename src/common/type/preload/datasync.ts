import type { AppLifecycleStatus } from './notification'

/**
 * @description: 数据同步模块接口
 */
export interface IDatasyncModule {
  /**
   * @description: 手动触发数据同步
   */
  manualSync(): Promise<boolean>

  /**
   * @description: 获取应用生命周期初始状态
   */
  getAppLifecycleStatus(): Promise<{ status: AppLifecycleStatus }>
}
