/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 构建期插件发现生成的虚拟模块契约；内容与 build/plugin/discovery.ts 的生成代码一一对应 */
declare module 'virtual:beaver-plugin-mains' {
  export interface IResolvedWindowApplication {
    createBrowserWindow: () => unknown
  }

  export interface IResolvedMainModule {
    manifest: { id: string }
    activate: (ctx: unknown) => void | Promise<void>
    application?: IResolvedWindowApplication
    extraApplications?: Record<string, IResolvedWindowApplication>
  }

  export const pluginLoaders: Record<string, () => Promise<IResolvedMainModule>>
}

declare module 'virtual:beaver-plugin-preloads' {
  export interface IResolvedInvoke {
    invoke: <T = unknown>(command: string, data?: unknown) => Promise<T>
    on: (channel: string, callback: (event: unknown, ...args: any[]) => void) => void
    off: (channel: string, callback: (event: unknown, ...args: any[]) => void) => void
  }

  export type ResolvedPreloadFactory = (ipc: IResolvedInvoke) => Record<string, unknown>

  /** key 是清单里声明的命名空间，直接展开到 electron.<namespace> */
  export const pluginPreloadFactories: Record<string, ResolvedPreloadFactory>
}

declare module 'virtual:beaver-plugin-renderer' {
  /**
   * key 是插件 id。未启用 / 不存在的插件不会出现在表里，取值方必须判空。
   * 具体形状由插件自己声明，宿主不 import 任何业务包的 UI 类型。
   */
  export const pluginRenderers: Record<string, Record<string, unknown>>
}
