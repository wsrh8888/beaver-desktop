/**
 * @description: 数据同步模块接口
 */
export interface IDatasyncModule {
  /**
   * @description: 手动触发数据同步
   */
  manualSync(): Promise<boolean>
}
