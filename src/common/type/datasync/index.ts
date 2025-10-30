// 同步状态枚举
export enum SyncStatus {
  /**
   * 待同步
   */
  PENDING = 'pending',
  /**
   * 同步中
   */
  SYNCING = 'syncing',
  /**
   * 同步完成
   */
  COMPLETED = 'completed',
  /**
   * 同步失败
   */
  FAILED = 'failed',
}
