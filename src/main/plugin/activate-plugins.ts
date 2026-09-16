/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 官方能力包加载表（编译期显式 import，供 Vite 打异步 chunk；不可用字符串变量动态 import）。
 *
 * 加包步骤：
 * 1. packages/app-xxx（exports 至少 ./main；窗口 html 放包根 <window>.html）
 * 2. 根 package.json file: 依赖
 * 3. 本文件 PLUGIN_LOADERS 加一行
 *
 * 包 main 约定导出（兼容旧名）：
 * - activate / manifest / application
 * - 或 {id}Manifest / {id}Application
 * - 多窗：extraApplications: { 'verify': app } 或旧名 verifyApplication / callIncomingApplication
 */
import type { IMainActivateContext, IMainPluginModule } from '@beaver-im/beaver'
import { getDirname, Logger, store } from '@beaver-im/beaver/main'
import type { BrowserWindow } from 'electron'

const logger = new Logger('PluginLoader')

/** Vite 要求静态路径；加包只改这一张表 */
const PLUGIN_LOADERS = {
  circle: () => import('@beaver-im/app-circle/main'),
  moment: () => import('@beaver-im/app-moment/main'),
  ai: () => import('@beaver-im/app-ai/main'),
  workbench: () => import('@beaver-im/app-workbench/main'),
  video: () => import('@beaver-im/app-video/main'),
  image: () => import('@beaver-im/app-image/main'),
  settings: () => import('@beaver-im/app-settings/main'),
  audio: () => import('@beaver-im/app-audio/main'),
  updater: () => import('@beaver-im/app-updater/main'),
  about: () => import('@beaver-im/app-about/main'),
  search: () => import('@beaver-im/app-search/main'),
  call: () => import('@beaver-im/app-call/main'),
} as const

export type PluginId = keyof typeof PLUGIN_LOADERS

/** 开窗入口名：含一包多窗的副入口 */
export type WindowAppName = PluginId | 'verify' | 'call-incoming'

export interface IWindowApplication {
  createBrowserWindow: () => BrowserWindow
}

type PluginMainModule = IMainPluginModule & {
  extraApplications?: Record<string, IWindowApplication>
  [key: string]: unknown
}

const applications = new Map<WindowAppName, IWindowApplication>()
let activated = false

function createActivateContext(): IMainActivateContext {
  return {
    store,
    getDirname: () => getDirname(),
    createLogger: (name = 'Plugin') => new Logger(name),
  }
}

function asWindowApp(value: unknown): IWindowApplication | null {
  if (value && typeof value === 'object' && typeof (value as IWindowApplication).createBrowserWindow === 'function')
    return value as IWindowApplication
  return null
}

/** 归一化各包 main 导出（标准名 + 历史命名 + 多窗 extras） */
function normalizePlugin(id: PluginId, mod: PluginMainModule): {
  plugin: IMainPluginModule
  extras: Record<string, IWindowApplication>
} {
  const manifest = (mod.manifest ?? mod[`${id}Manifest`]) as IMainPluginModule['manifest']
  const application = (mod.application ?? mod[`${id}Application`]) as IMainPluginModule['application']
  const extras: Record<string, IWindowApplication> = { ...(mod.extraApplications ?? {}) }

  // 兼容尚未改为 extraApplications 的双窗包
  const verify = asWindowApp(mod.verifyApplication)
  if (verify)
    extras.verify = verify
  const callIncoming = asWindowApp(mod.callIncomingApplication)
  if (callIncoming)
    extras['call-incoming'] = callIncoming

  return {
    plugin: {
      manifest,
      activate: mod.activate,
      application,
    },
    extras,
  }
}

/**
 * 启动早期按规范 activate 官方能力包（须在 bindMain 之后、message/IPC 之前）。
 */
export async function activatePlugins(): Promise<void> {
  if (activated)
    return

  const ctx = createActivateContext()

  for (const id of Object.keys(PLUGIN_LOADERS) as PluginId[]) {
    try {
      const mod = await PLUGIN_LOADERS[id]() as PluginMainModule
      const { plugin, extras } = normalizePlugin(id, mod)

      if (plugin.activate)
        await plugin.activate(ctx)

      const mainApp = asWindowApp(plugin.application)
      if (mainApp)
        applications.set(id, mainApp)

      for (const [name, app] of Object.entries(extras)) {
        const win = asWindowApp(app)
        if (win)
          applications.set(name as WindowAppName, win)
      }

      logger.info({ text: '插件已激活', data: { id: plugin.manifest?.id ?? id } })
    }
    catch (error: any) {
      logger.warn({
        text: '插件激活失败，已跳过',
        data: { id, message: error?.message },
      })
    }
  }

  activated = true
}

/** 取已激活插件的窗口入口；未激活或失败时返回 null */
export function getPluginApplication(id: string): IWindowApplication | null {
  return applications.get(id as WindowAppName) ?? null
}
