/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 宿主 Vite 辅助：写死入口，不加魔法。
 * - 已走包内 dist 的能力包（app-about / app-audio / app-circle / app-moment / app-settings / app-video / app-image / app-updater / app-search / app-call / app-workbench）不进 SRC_APPS
 * - 下列包仍走源码 alias + 宿主编 html
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const nm = path.resolve(projectRoot, 'node_modules')

export type ViteAlias = { find: string | RegExp, replacement: string }

function pkg(...segs: string[]) {
  return path.resolve(projectRoot, 'packages', ...segs)
}

function root(...segs: string[]) {
  return path.resolve(projectRoot, ...segs)
}

/** 还走源码的能力包（发版吃 dist 的不要写进来） */
const SRC_APPS = [
  'beaver-ui',
  'beaver-biz',
] as const

export function createAliases(): ViteAlias[] {
  const aliases: ViteAlias[] = [
    { find: 'commonModule', replacement: root('src/common') },
    { find: 'mainModule', replacement: root('src/main') },
    { find: 'renderModule', replacement: root('src/render') },
    { find: 'preloadModule', replacement: root('src/preload') },
    { find: 'vue-router', replacement: path.resolve(nm, 'vue-router') },
    { find: 'marked', replacement: path.resolve(nm, 'marked') },
  ]

  for (const dir of SRC_APPS) {
    const name = `@beaver-im/${dir}`
    const src = pkg(dir, 'src')
    aliases.push(
      { find: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.*)$`), replacement: `${src}/$1` },
      { find: name, replacement: path.join(src, 'index.ts') },
    )
  }

  return aliases
}

/** 宿主要编的窗口 html（about 自带 dist，不在此列） */
export function htmlInputs(): Record<string, string> {
  return {
    app: root('app.html'),
    login: root('login.html'),
    ai: root('ai.html'),
  }
}
