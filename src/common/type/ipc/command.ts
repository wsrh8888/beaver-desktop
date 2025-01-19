
/**
 * @description: 系统钩子的common
 */
export enum WinHook {
  /**
   * @description: 关闭窗口
   */
  CLOSE = 'close',
  /**
   * @description: 最小化窗口
   */  
  MINIMIZE = 'minimize',
  /**
   * @description: 打开窗口
   */
  OPEN = 'open'
}

/**
 * @description: 公共的Command
 */
export enum RenderCommand {
  LOG = 'log',
  STORE = 'store',

}

/**
 * @description: 小程序Command
 */
export enum EMiniApp {
  REQUEST = 'request',
  SAVEFILE = 'saveFile',
  GETSAVEDFILELIST = 'getSavedFileList',
  CHOOSEIMAGE = 'chooseImage',
  PREVIEWIMAGE = 'previewImage',
  Plugins = 'plugins',

}

/**
 * @description: renderCommand
 */
export enum ElectronCommand {
  SCREENCAPTURE = 'screenCapture',
  OPENAPP = 'openApp',
  Donwload = 'download',
  Check = 'check',
  DownLoadPlugin = 'downLoadPlugin',
  InjerctPlugin = 'injerctPlugin'
}
