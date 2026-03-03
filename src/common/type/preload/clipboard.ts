/**
 * @description: 剪贴板模块（主进程统一写剪贴板，与复制逻辑统一）
 */
export interface IClipboardModule {
  /** 复制图片到系统剪贴板（本地缓存或云端 URL），返回是否成功 */
  copyImage(fileKey: string): Promise<boolean>
  /** 复制文本到系统剪贴板，返回是否成功 */
  copyText(text: string): Promise<boolean>
}
