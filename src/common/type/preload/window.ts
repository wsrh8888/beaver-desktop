import { ILogger } from "commonModule/type/logger"; // 确保 ILogger 的导入路径正确

/**
 * @description: Electron preload接口
 */
export interface ElectronAPP {
  /**
   * @description: 日志模块
   */
  logger: {
    /**
     * 记录信息级别日志。
     * @param data - 日志数据，符合 ILogger 接口。
     * @param moduleName - (可选) 模块名称。
     */
    info: (data: ILogger, moduleName: string) => void;
    /**
     * 记录错误级别日志。
     * @param data - 日志数据，符合 ILogger 接口。
     * @param moduleName - (可选) 模块名称。
     */
    error: (data: ILogger, moduleName: string) => void;
    
    warn: (data: ILogger, moduleName: string) => void;
  };

  /**
   * @description: 窗口管理模块
   */
  window: {
    /**
     * 关闭指定名称的窗口。
     * @param name - (可选) 要关闭的窗口的名称。
     */
    close: (name?: string) => void;
    /**
     * 打开指定名称的render窗口。
     * @param name - 要打开的窗口的名称。
     */
    open: (name: string) => void;
    /**
     * 打开指定名称的窗口。
     * @param name - 要打开的窗口的名称。
     */
    openWindow: (name: string) => void;
    /**
     * 最小化当前窗口。
     */
    minimize: () => void;
  };

  /**
   * @description: 应用信息模块
   */
  app: {
    /**
     * @description: Electron 及 Node.js 等相关依赖的版本信息。
     */
    versions: NodeJS.ProcessVersions;
    /**
     * @description: 应用的根路径。
     */
    rootPath: string;
    /**
     * @description: 应用的 token。
     */
    token: string | undefined;
    /**
     * @description: 应用的设备唯一标识。
     */
    devicedId: string | undefined;
    /**
     * 环境变量，例如 测试或生产环境。
     * @example 'test', 'prod'
     */
    env: 'prod' | 'test';
  };

  /**
   * @description: 数据存储模块
   */
  storage: {
    /**
     * 设置键值对数据。
     * @param key - 数据的键。
     * @param value - 数据的值。
     */
    setData: (key: string, value: any) => void;
    /**
     * 保存指定的 store 数据。
     * @param name - store 的名称。
     * @param data - 要保存的数据对象。
     * @returns Promise<any> - 操作完成的 Promise，可能包含操作结果。
     */
    saveStore: (name: string, data: {}) => Promise<any>;
  };
}
