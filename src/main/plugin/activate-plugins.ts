/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 插件装配：加载表由构建期发现（build/plugin/catalog.ts → virtual:beaver-plugin-mains）生成。
 *
 * 宿主不列举任何业务包名：enabled=false 或可选包缺失时，加载表里根本没有对应条目，
 * 编译期即完成剪枝，不存在「运行时 try/catch 假装能跳过」。
 * 插件只实现平台契约 IMainPluginModule：manifest / activate / application / extraApplications。
 */
import type { IMainActivateContext, IMainPluginModule } from '@beaver-im/beaver'
import { getDirname, Logger, store } from '@beaver-im/beaver/main'
import type { BrowserWindow } from 'electron'
import { pluginLoaders } from 'virtual:beaver-plugin-mains'

const logger = new Logger('PluginLoader')

export interface IWindowApplication {
  createBrowserWindow: () => BrowserWindow
}

const applications = new Map<string, IWindowApplication>()
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

/** 实际已激活的窗口名，供 MCP 等消费方派生，禁止硬编码窗口清单 */
export function getPluginWindowNames(): string[] {
  return [...applications.keys()]
}

/** 启动早期按平台契约 activate 已装配的插件（须在 bindMain 之后、message/IPC 之前） */
export async function activatePlugins(): Promise<void> {
  if (activated)
    return

  const ctx = createActivateContext()

  for (const [id, load] of Object.entries(pluginLoaders)) {
    try {
      const mod = await load() as IMainPluginModule
      if (mod.manifest.id !== id)
        throw new Error(`manifest.id=${mod.manifest.id} 与清单 id=${id} 不一致`)

      await mod.activate(ctx)

      const mainApp = asWindowApp(mod.application)
      if (mainApp)
        applications.set(id, mainApp)

      for (const [name, app] of Object.entries(mod.extraApplications ?? {})) {
        const win = asWindowApp(app)
        if (win)
          applications.set(name, win)
      }

      logger.info({ text: '插件已激活', data: { id } })
    }
    catch (error: any) {
      logger.warn({ text: '插件运行时激活失败，已隔离', data: { id, message: error?.message } })
    }
  }

  activated = true
}

/** 取已激活插件的窗口入口；插件未启用或激活失败时返回 null */
export function getPluginApplication(id: string): IWindowApplication | null {
  return applications.get(id) ?? null
}
