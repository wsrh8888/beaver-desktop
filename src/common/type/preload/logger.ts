import type { ILogger } from 'commonModule/type/logger'

/**
 * @description: 日志模块接口
 */
export interface ILoggerModule {
  /**
   * 记录信息级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  info(data: ILogger, moduleName: string): void
  /**
   * 记录错误级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  error(data: ILogger, moduleName: string): void
  /**
   * 记录警告级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  warn(data: ILogger, moduleName: string): void
}
