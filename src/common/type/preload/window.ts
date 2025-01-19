

/**
 * @description: Electron preload接口
 */
export interface ElectronAPP {
  /**
   * 关闭指定名称的窗口。
   * @param name - 要关闭的窗口的名称。
   */
  closeWindow: (name?: string) => void;

  /**
   * 环境变量，例如 测试或生产环境。
   * @example 'test', 'prod'
   */
  env: 'prod' | 'test';

  /**
   * 打开指定名称的render窗口。
   * @param name - 要打开的窗口的名称。
   */
  openWindow: (name: string) => void;

  /**
   * @description: 获取app版本
   */
  getAppVersion: NodeJS.ProcessVersions;

  
  /**
   * @description: 日志
   */
  log: (level: string, data: string) => void;

  /**
   * @description: 页面配置
   */
  page: {
    setTitle: (title: string) => void;
  };

  /**
   * @description: 存储数据
   */  
  storeData: (key: string, value: {}) => void;
  
  token: string;

}
