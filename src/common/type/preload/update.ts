/**
 * @description: 下载更新参数接口
 */
export interface IDownloadOptions {
  /**
   * @description: 文件Key（包含MD5和后缀名）
   */
  fileKey: string
  /**
   * @description: 文件MD5值用于校验
   */
  md5: string
  /**
   * @description: 文件版本
   */
  version: string
}

/**
 * @description: 升级模块接口
 */
export interface IUpdateModule {
  /**
   * @description: 保存之前的监听器引用
   */
  previousHandler: any
  /**
   * 下载更新，传入下载参数对象和进度回调函数。
   * @param options - 下载参数对象
   * @param onProgress - 进度回调函数，参数为下载进度(0-100)
   */
  downloadUpdate(options: IDownloadOptions, onProgress: (progress: number) => void): void
  /**
   * 触发升级。
   */
  startUpdate(options: IDownloadOptions): void
}
