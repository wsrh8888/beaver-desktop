/**
 * @description: 窗口管理模块接口
 */
export interface IWindowModule {
  /**
   * 关闭窗口。
   * @param name - (可选) 要关闭的窗口名称，不传则关闭当前窗口。
   * @param options - (可选) 窗口选项。
   * @param options.hideOnly - (可选) 仅隐藏而不销毁窗口，默认为 false。
   * @param options.isSelf - (可选) 是否是自己关闭的窗口，默认为 false。
   */
  closeWindow(name?: string, options?: { hideOnly?: boolean, isSelf?: boolean }): void

  /**
   * 打开一个窗口。
   * @param name - 要打开的窗口名称。
   * @param options - (可选) 窗口选项。
   */
  openWindow(name: string, options?: any): void

  /**
   * 最小化当前窗口。
   */
  minimize(): void

  /**
   * 最大化当前窗口。
   */
  maximize(): void
}
