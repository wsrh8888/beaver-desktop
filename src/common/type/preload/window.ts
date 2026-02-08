export interface IWinodwCloseOptions {
  /**
   * @description: 是否仅隐藏，默认不隐藏
   */
  hideOnly?: boolean
}

export interface IWindowOpenOptions {
  /**
   * @description: 是否唯一，默认唯一
   */
  unique?: boolean
  /**
   * @description: 窗口宽度
   */
  width?: number
  /**
   * @description: 窗口高度
   */
  height?: number
  /**
   * @description: 窗口参数（用于传递数据）
   */
  params?: Record<string, any>
}

/**
 * @description: 窗口管理模块接口
 */
export interface IWindowModule {
  /**
   * 关闭窗口。
   * @param name - (可选) 要关闭的窗口名称，不传则关闭当前窗口。
   * @param options - (可选) 窗口选项。
   * @param options.hideOnly - (可选) 仅隐藏而不销毁窗口，默认为 false。
   */
  closeWindow(name?: string, options?: IWinodwCloseOptions): void

  /**
   * 打开一个窗口。
   * @param name - 要打开的窗口名称。
   * @param options - (可选) 窗口选项。
   */
  openWindow(name: string, options?: IWindowOpenOptions): Promise<void>

  /**
   * 最小化当前窗口。
   */
  minimize(): void

  /**
   * 最大化当前窗口。
   */
  maximize(): void
}
