
export interface IPluginInfo {
  /**
   * @description: 插件名称
   */  
  name: string;
  /**
   * @description: 插件描述
   */
  description: string;
  /**
   * @description: 插件版本
   */
  version: string;
  /**
   * @description: 插件下载地址
   */
  url: string;
  /**
   * @description: 是否注入
   */
  inject: number;
}