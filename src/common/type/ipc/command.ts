/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
   * @description: 打开指定名称的窗口
   */
  OPEN_WINDOW = 'winHook:openWindow',
  /**
   * @description: 截取当前屏幕（整屏）
   */
  CAPTURE_SCREEN = 'winHook:captureScreen',
}

/**
 * @description: 剪贴板相关 Command（主进程统一写剪贴板）
 */
export enum ClipboardCommand {
  COPY_IMAGE = 'clipboard:copyImage',
  COPY_TEXT = 'clipboard:copyText',
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
 * @description: 数据同步相关的Command
 */
export enum DataSyncCommand {
  /**
   * @description: 手动触发同步
   */
  MANUAL_SYNC = 'datasync:manualSync',
  /**
   * @description: 获取应用生命周期初始状态
   */
  GET_APP_LIFECYCLE_STATUS = 'datasync:getAppLifecycleStatus',
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
  /**
   * @description: 下载并打开本地文件
   */
  OPEN = 'cache:open',
}

/**
 * @description: 键盘快捷键相关的 Command
 */
export enum KeyboardCommand {
  /**
   * @description: 更新单个快捷键 actionId → binding
   */
  SET = 'keyboard:set',
}

/**
 * @description: 用户设置（主进程 store 读写）
 */
export enum SettingsCommand {
  /**
   * @description: 初始化用户设置（登录后拉取云端）
   */
  SETTINGS_INIT = 'settings:init',
  /**
   * @description: 获取用户设置
   */
  SETTINGS_GET = 'settings:get',
  /**
   * @description: 保存用户设置
   */
  SETTINGS_UPDATE = 'settings:update',
}

/**
 * @description: 认证相关的 Command
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
   * @description: 重新连接WebSocket
   */
  RECONNECT = 'websocket:reconnect',
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
  GROUP = 'database:group',
  CIRCLE = 'database:circle',
  EMOJI = 'database:emoji',
  NOTIFICATION = 'database:notification',
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
  /**
   * @description: 显示系统通知
   */
  ShowSystemNotification = 'notification:showSystemNotification',
  /**
   * @description: 更新托盘菜单项列表
   */
  UpdateTray = 'notification:updateTray',
  /**
   * @description: 删除托盘菜单项
   */
  DeleteTrayItem = 'notification:deleteTrayItem',
}

/**
 * @description: 工作台内嵌 WebContentsView 相关 Command
 */
export enum WorkbenchCommand {
  EMBED_OPEN = 'workbench:embedOpen',
  EMBED_HIDE_ALL = 'workbench:embedHideAll',
  EMBED_SET_BOUNDS = 'workbench:embedSetBounds',
  EMBED_RELOAD = 'workbench:embedReload',
  EMBED_CLOSE = 'workbench:embedClose',
  OPEN_EXTERNAL = 'workbench:openExternal',
}

/**
 * @description: 内嵌页 JSBridge 相关 Command（与具体宿主解耦）
 */
export enum BridgeCommand {
  INVOKE = 'bridge:invoke',
}

/**
 * @description: 通用文件系统 Command（与业务解耦）
 */
export enum FsCommand {
  /** 创建目录（recursive） */
  MKDIR = 'fs:mkdir',
  /** 路径是否存在 */
  EXISTS = 'fs:exists',
  /** 获取系统路径（documents / desktop / home / userData 等） */
  GET_PATH = 'fs:getPath',
  /** path.join */
  JOIN = 'fs:join',
  /** path.basename */
  BASENAME = 'fs:basename',
  /** 系统目录选择器 */
  SHOW_OPEN_DIRECTORY = 'fs:showOpenDirectory',
}
