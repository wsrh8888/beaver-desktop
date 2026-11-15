/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 渲染层按命名空间取插件 API。
 *
 * 宿主源码不 import 任何 @beaver-im/app-* 的类型或实现；启用集合由
 * build/plugin/catalog.ts 在构建期决定，preload 把各插件工厂的结果挂到 electron 上。
 * 调用方用自己的局部接口描述所需形状，插件未启用时返回 undefined。
 */
export function getPluginApi<T>(namespace: string): T | undefined {
  const host = globalThis as unknown as { electron?: Record<string, unknown> }
  return host.electron?.[namespace] as T | undefined
}

/** 取插件 API；插件未启用时立即失败，避免把 undefined 当成可用能力继续跑。 */
export function requirePluginApi<T>(namespace: string): T {
  const api = getPluginApi<T>(namespace)
  if (!api)
    throw new Error(`[beaver] 插件 ${namespace} 未启用，无法使用其渲染 API`)
  return api
}
