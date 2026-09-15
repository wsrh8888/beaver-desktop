/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { BrowserWindow } from 'electron'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('PluginLoader')

/** 可动态加载的窗口 application（与现有 Application 用法对齐） */
export interface IWindowApplication {
  createBrowserWindow: () => BrowserWindow
}

type OptionalAppId = 'ai' | 'moment' | 'circle'

const cache = new Map<OptionalAppId, IWindowApplication | null>()

/**
 * 按需动态加载可选能力包的窗口入口。
 * - 打开对应窗口时才 import，减轻启动期耦合
 * - 加载失败 → 返回 null（日志告警，壳子继续跑）
 *
 * 说明：完整版需在 package.json 保留对应依赖，供 Vite 打出异步 chunk。
 * 真正「未安装也能构建」要等能力包发编译后的 npm 产物后再用运行时解析。
 */
export async function loadOptionalWindowApp(id: OptionalAppId): Promise<IWindowApplication | null> {
  if (cache.has(id)) {
    return cache.get(id) ?? null
  }

  try {
    let app: IWindowApplication | undefined

    switch (id) {
      case 'ai': {
        const mod = await import('@beaver-im/app-ai/main')
        app = mod.aiApplication
        break
      }
      case 'moment': {
        const mod = await import('@beaver-im/app-moment/main')
        app = mod.momentApplication
        break
      }
      case 'circle': {
        const mod = await import('@beaver-im/app-circle/main')
        app = mod.circleApplication
        break
      }
      default:
        break
    }

    if (!app || typeof app.createBrowserWindow !== 'function') {
      logger.warn({ text: '可选能力包入口无效', data: { id } })
      cache.set(id, null)
      return null
    }

    cache.set(id, app)
    logger.info({ text: '可选能力包加载成功', data: { id } })
    return app
  }
  catch (error: any) {
    logger.warn({
      text: '可选能力包加载失败，已跳过',
      data: { id, message: error?.message },
    })
    cache.set(id, null)
    return null
  }
}
