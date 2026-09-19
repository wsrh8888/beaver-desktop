/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 宿主 Vite 辅助。
 * 能力包窗口用字符串名单重定向到源码 html，不读 package.json。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const nm = path.resolve(projectRoot, 'node_modules')

export type ViteAlias = { find: string | RegExp, replacement: string }

function root(...segs: string[]) {
  return path.resolve(projectRoot, ...segs)
}

export function createAliases(): ViteAlias[] {
  return [
    { find: 'commonModule', replacement: root('src/common') },
    { find: 'mainModule', replacement: root('src/main') },
    { find: 'renderModule', replacement: root('src/render') },
    { find: 'preloadModule', replacement: root('src/preload') },
    { find: 'vue-router', replacement: path.resolve(nm, 'vue-router') },
    { find: 'marked', replacement: path.resolve(nm, 'marked') },
  ]
}

/** 宿主要编的窗口 html。app-ai 在仓库外，窗口走它自己的 dist，不进宿主 */
export function htmlInputs(): Record<string, string> {
  return {
    app: root('app.html'),
    login: root('login.html'),
  }
}

/** 开发态 /<name>.html 对应的能力包源码页 */
const PACKAGE_HTML = [
  'packages/app-about/about.html',
  'packages/app-audio/audio.html',
  'packages/app-call/call.html',
  'packages/app-call/call-incoming.html',
  'packages/app-circle/circle.html',
  'packages/app-image/image.html',
  'packages/app-moment/moment.html',
  'packages/app-search/search.html',
  'packages/app-search/verify.html',
  'packages/app-settings/settings.html',
  'packages/app-updater/updater.html',
  'packages/app-video/video.html',
  'packages/app-workbench/workbench.html',
]

export function packageHtmlDev() {
  return {
    name: 'package-html-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname = '', query] = (req.url ?? '').split('?')
        const file = pathname.replace(/^\//, '')
        if (!file || file.startsWith('packages/'))
          return next()
        const target = PACKAGE_HTML.find(item => item.endsWith(`/${file}`))
        if (!target)
          return next()
        // 必须改浏览器地址，html 里的 ./src 才能落到 packages/<app>/src
        const location = query ? `/${target}?${query}` : `/${target}`
        res.statusCode = 302
        res.setHeader('Location', location)
        res.end()
      })
    },
  }
}

const EXTERNAL = ['electron', 'electron-screenshots', 'ws', '@beaver-im/app-ai']

export function externalOf(id: string) {
  return EXTERNAL.some(name => id === name || id.startsWith(`${name}/`))
}
