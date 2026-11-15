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
 * - enabled: 构建期开关。false 的包不参与编译、不 activate、不暴露 preload / renderer 能力。
 * - optional: 允许包不存在。缺失时静默跳过；非 optional 包缺失属于配置错误，直接构建失败。
 * - root: 仓库外包目录（相对宿主根）。存在时按它的 package.json exports 注入解析映射，
 *   因此不需要把商业仓库写进 dependencies。
 * - preload: 渲染进程命名空间名。声明后插件的 ./preload 入口被装配到 electron.<preload>；
 *   入口必须实现平台契约 IPluginPreloadFactory，唯一导出 createPreloadModule。
 * - renderer: 是否向主窗口注入 UI 能力。只有显式声明的包才生成到
 *   virtual:beaver-plugin-renderer，避免把全部插件渲染代码打进主窗口。
 *
 * 窗口名不在这里声明：插件通过 application / extraApplications 自行注册，平台只做注册表。
 */
export interface IPluginCatalogEntry {
  id: string
  package: string
  enabled: boolean
  optional?: boolean
  root?: string
  preload?: string
  renderer?: boolean
}

export const PLUGIN_CATALOG: readonly IPluginCatalogEntry[] = [
  {
    id: 'circle',
    package: '@beaver-im/app-circle',
    enabled: true,
    preload: 'circle',
    renderer: true,
  },
  { id: 'moment', package: '@beaver-im/app-moment', enabled: true },
  { id: 'doc', package: '@beaver-im/app-doc', enabled: true },
  {
    id: 'ai',
    package: '@beaver-im/app-ai',
    enabled: true,
    optional: true,
    root: '../beaver-agent/agent_electron',
    preload: 'agent',
  },
  { id: 'workbench', package: '@beaver-im/app-workbench', enabled: true, preload: 'workbench' },
  { id: 'video', package: '@beaver-im/app-video', enabled: true },
  { id: 'image', package: '@beaver-im/app-image', enabled: true },
  { id: 'settings', package: '@beaver-im/app-settings', enabled: true, preload: 'settings' },
  { id: 'audio', package: '@beaver-im/app-audio', enabled: true },
  { id: 'updater', package: '@beaver-im/app-updater', enabled: true },
  { id: 'about', package: '@beaver-im/app-about', enabled: true },
  { id: 'search', package: '@beaver-im/app-search', enabled: true },
  { id: 'call', package: '@beaver-im/app-call', enabled: true },
]
