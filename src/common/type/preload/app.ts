/**
 * @description: 应用信息模块接口
 */
export interface IAppModule {
  /**
   * @description: Electron 及 Node.js 等相关依赖的版本信息。
   */
  versions: NodeJS.ProcessVersions
  /**
   * @description: 应用的根路径。
   */
  rootPath: string
  /**
   * @description: 应用的 token。
   */
  token: string | undefined
  /**
   * @description: 应用的设备唯一标识。
   */
  devicedId: string | undefined
  /**
   * 环境变量，例如 测试或生产环境。
   * @example 'test', 'prod'
   */
  env: 'prod' | 'test' | 'dev'
}
