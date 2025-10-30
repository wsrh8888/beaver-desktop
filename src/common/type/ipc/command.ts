/**
 * @description: 系统钩子的common
 */
export enum WinHook {
  /**
   * @description: 隐藏窗口到后台而不是真正关闭
   */
  CLOSE = 'winHook:close',
  /**
   * @description: 将窗口最小化到任务栏
   */
  MINIMIZE = 'winHook:minimize',
  /**
   * @description: 将窗口最大化到全屏
   */
  MAXIMIZE = 'winHook:maximize',
  /**
   * @description: 从最大化或最小化状态恢复窗口到正常大小
   */
  RESTORE = 'winHook:restore',
  /**
   * @description: 打开指定名称的窗口
   */
  OPEN_WINDOW = 'winHook:openWindow',
  /**
   * @description: 用户退出登录，清除登录状态并跳转到登录页面
   */
  LOGINOUT = 'winHook:loginOut',
  /**
   * @description: 检查窗口是否最大化
   */
  IS_MAXIMIZED = 'winHook:isMaximized',
}

/**
 * @description: 公共的Command
 */
export enum RenderCommand {

  /**
   * @description: 保存指定的存储数据到本地文件
   */
  SAVESTORE = 'render:saveStore',
}

export enum LoggerCommand {
  /**
   * @description: 用于记录应用日志信息
   */
  LOG = 'render:log',
}

/**
 * @description: 存储相关的Command
 */
export enum StorageCommand {
  /**
   * @description: 根据键获取存储的数据
   */
  GET = 'storage:get',
  /**
   * @description: 设置键值对数据到存储
   */
  SET = 'storage:set',
  /**
   * @description: 根据键删除存储的数据
   */
  REMOVE = 'storage:remove',
  /**
   * @description: 向数组类型的数据中添加新项
   */
  ADD = 'storage:add',
}

/**
 * @description: 配置相关的Command
 */
export enum ConfigCommand {
  /**
   * @description: 获取配置
   */
  GET = 'config:get',
}

/**
 * @description: 网络相关的Command
 */
export enum NetworkCommand {
}

/**
 * @description: 升级相关的Command
 */
export enum UpdateCommand {
  /**
   * @description: 开始下载更新
   */
  DOWNLOAD_UPDATE = 'update:downloadUpdate',
  /**
   * @description: 开始执行升级
   */
  START_UPDATE = 'update:startUpdate',
  /**
   * @description: 下载进度更新事件
   */
  DOWNLOAD_PROGRESS = 'download-progress',
}

/**
 * @description: 小程序Command
 */
export enum EMiniApp {
  /**
   * @description: 发送HTTP请求
   */
  REQUEST = 'miniApp:request',
  /**
   * @description: 将文件保存到本地
   */
  SAVEFILE = 'miniApp:saveFile',
  /**
   * @description: 获取本地已保存的文件列表
   */
  GETSAVEDFILELIST = 'miniApp:getSavedFileList',
  /**
   * @description: 从本地选择图片文件
   */
  CHOOSEIMAGE = 'miniApp:chooseImage',
  /**
   * @description: 预览选中的图片
   */
  PREVIEWIMAGE = 'miniApp:previewImage',
  /**
   * @description: 处理插件相关的操作
   */
  Plugins = 'miniApp:plugins',
}

/**
 * @description: 缓存相关的Command - 清晰的方法分离
 */
export enum CacheCommand {
  /**
   * @description: 获取缓存内容
   */
  GET = 'cache:get',
  /**
   * @description: 设置缓存内容
   */
  SET = 'cache:set',
}

/**
 * @description: 认证相关的Command
 */
export enum AuthCommand {
  /**
   * @description: 登录
   */
  LOGIN = 'auth:login',

  /**
   * @description: 登出
   */
  LOGOUT = 'auth:logout',
}

/**
 * @description: 数据同步相关的Command - 简化版
 */
export enum DataSyncCommand {
  /**
   * @description: 初始化数据同步
   */
  INITIALIZE = 'datasync:initialize',
  /**
   * @description: 手动触发同步
   */
  MANUAL_SYNC = 'datasync:manualSync',
  /**
   * @description: 获取同步状态
   */
  GET_SYNC_STATUS = 'datasync:getSyncStatus',
}

/**
 * @description: WebSocket相关的Command
 */
export enum WebSocketCommand {
  /**
   * @description: 连接WebSocket
   */
  CONNECT = 'websocket:connect',
  /**
   * @description: 断开WebSocket连接
   */
  DISCONNECT = 'websocket:disconnect',
  /**
   * @description: 发送消息
   */
  SEND_CHAT_MESSAGE = 'websocket:sendChatMessage',
}

/**
 * @description: 数据库相关的Command - 简洁统一架构
 */
export enum DatabaseCommand {

  USER = 'database:user',
  FRIEND = 'database:friend',
  CHAT = 'database:chat',
}

/**
 * @description: Electron主进程Command
 */
export enum ElectronCommand {
  /**
   * @description: 捕获屏幕截图
   */
  SCREENCAPTURE = 'electron:screenCapture',
  /**
   * @description: 打开指定的外部应用
   */
  OPENAPP = 'electron:openApp',
  /**
   * @description: 下载文件到本地
   */
  Donwload = 'electron:download',
  /**
   * @description: 执行检查相关的操作
   */
  Check = 'electron:check',
  /**
   * @description: 下载并安装插件
   */
  DownLoadPlugin = 'electron:downLoadPlugin',
  /**
   * @description: 将插件注入到应用中
   */
  InjectPlugin = 'electron:injectPlugin',
}

/**
 * @description: 通知相关的Command
 */
export enum NotificationCommand {
  /**
   * @description: 发送通知
   */
  Send = 'notification:send',
}
