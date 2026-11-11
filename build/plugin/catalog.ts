/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 插件清单：宿主唯一列举能力包的地方。
 *
 * - enabled: 构建期开关。false 的包不参与编译、不 activate、不暴露 preload API。
 * - optional: 允许包不存在。缺失时静默跳过；非 optional 包缺失属于配置错误，直接构建失败。
 * - root: 仓库外包目录（相对宿主根）。存在时按它的 package.json exports 注入解析映射，
 *   因此不需要把商业仓库写进 dependencies。
 * - preload: 插件的 preload 入口实现了 IPluginPreloadFactory，运行时注入到 electron.plugins。
 *
 * 窗口名不在这里声明：插件通过 application / extraApplications 自行注册，平台只做注册表。
 */
export interface IPluginCatalogEntry {
  id: string
  package: string
  enabled: boolean
  optional?: boolean
  root?: string
  preload?: boolean
}

export const PLUGIN_CATALOG: readonly IPluginCatalogEntry[] = [
  { id: 'circle', package: '@beaver-im/app-circle', enabled: true },
  { id: 'moment', package: '@beaver-im/app-moment', enabled: true },
  { id: 'doc', package: '@beaver-im/app-doc', enabled: true },
  {
    id: 'ai',
    package: '@beaver-im/app-ai',
    enabled: true,
    optional: true,
    root: '../beaver-agent/agent_electron',
    preload: true,
  },
  { id: 'workbench', package: '@beaver-im/app-workbench', enabled: true, preload: true },
  { id: 'video', package: '@beaver-im/app-video', enabled: true },
  { id: 'image', package: '@beaver-im/app-image', enabled: true },
  { id: 'settings', package: '@beaver-im/app-settings', enabled: true, preload: true },
  { id: 'audio', package: '@beaver-im/app-audio', enabled: true },
  { id: 'updater', package: '@beaver-im/app-updater', enabled: true },
  { id: 'about', package: '@beaver-im/app-about', enabled: true },
  { id: 'search', package: '@beaver-im/app-search', enabled: true },
  { id: 'call', package: '@beaver-im/app-call', enabled: true },
]
