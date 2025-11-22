/**
 * @description: 托盘菜单项
 */
export interface TrayMenuItem {
  id: string

  /**
   * @description: 菜单项标签/标题
   */
  label: string
  /**
   * @description: 未读数量
   */
  count?: number

  /**
   * @description: 类型，这个通知是什么类型的通知， 是聊天消息通知，还是系统消息通知，还是其他通知
   */
  type: 'chat' | 'system' | 'other'
}

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

  /**
   * @description: 应用的版本。
   */
  version: string
}
