import type { IConfig } from 'commonModule/type/config'

/**
 * @description: 配置模块接口
 */
export interface IConfigModule {
  /**
   * 获取配置。
   * @returns IConfig - 配置对象。
   */
  get(): IConfig
}
