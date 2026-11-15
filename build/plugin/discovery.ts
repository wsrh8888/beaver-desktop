/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 构建期插件发现。
 *
 * 清单是唯一事实来源：enabled=false 或可选包缺失时，生成的代码里完全不出现该包，
 * Rolldown 因而没有可解析的 import，达到「编译期剪枝」而不是「运行时 try/catch 兜底」。
 *
 * 包的存在性与能力校验都直接读 package.json，不用 require.resolve(pkg/package.json)：
 * workspace 包的 exports 不暴露 ./package.json，用 Node 解析会抛 ERR_PACKAGE_PATH_NOT_EXPORTED。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { PLUGIN_CATALOG, type IPluginCatalogEntry } from './catalog.ts'

export type ViteAlias = { find: string | RegExp, replacement: string }

export const VIRTUAL_MAINS = 'virtual:beaver-plugin-mains'
export const VIRTUAL_PRELOADS = 'virtual:beaver-plugin-preloads'
export const VIRTUAL_RENDERERS = 'virtual:beaver-plugin-renderer'

const RESOLVED_PREFIX = '\0virtual:'
const hostRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export interface IPluginDiscovery {
  entries: readonly IPluginCatalogEntry[]
  aliases: ViteAlias[]
  roots: string[]
  mainsCode: string
  preloadsCode: string
  renderersCode: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

/** 取 exports 里当前构建态对应的目标；不保留任何历史条件分支 */
function pickTarget(value: unknown, condition: 'development' | 'default'): string | null {
  if (typeof value === 'string')
    return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const picked = record[condition] ?? record.default
    return typeof picked === 'string' ? picked : null
  }
  return null
}

/** 把包的 exports 展开成精确 alias，让仓库外包无需进入 node_modules 也能被静态解析 */
function aliasesFromExports(
  packageName: string,
  root: string,
  exportsMap: Record<string, unknown>,
  condition: 'development' | 'default',
): ViteAlias[] {
  const aliases: ViteAlias[] = []

  for (const [subpath, value] of Object.entries(exportsMap)) {
    if (!subpath.startsWith('./') || subpath === './package.json')
      continue
    const target = pickTarget(value, condition)
    if (!target || !target.startsWith('./'))
      continue

    const sub = subpath.slice(2)
    const star = sub.indexOf('*')
    if (star === -1) {
      aliases.push({
        find: new RegExp(`^${escapeRegExp(packageName)}/${escapeRegExp(sub)}$`),
        replacement: toPosix(path.resolve(root, target)),
      })
      continue
    }

    const before = sub.slice(0, star)
    const after = sub.slice(star + 1)
    const targetStar = target.indexOf('*')
    const targetBefore = targetStar === -1 ? target : target.slice(0, targetStar)
    const targetAfter = targetStar === -1 ? '' : target.slice(targetStar + 1)
    const separator = targetBefore.endsWith('/') ? '/' : ''
    aliases.push({
      find: new RegExp(`^${escapeRegExp(packageName)}/${escapeRegExp(before)}(.*)${escapeRegExp(after)}$`),
      replacement: `${toPosix(path.resolve(root, targetBefore))}${separator}$1${targetAfter}`,
    })
  }

  return aliases
}

/**
 * 定位已安装包目录。workspace 包在 node_modules 里是 pnpm 软链，逐级向上找；
 * 全程只依赖文件系统，不受 exports 限制影响。
 */
function findInstalledPackageRoot(packageName: string): string | null {
  let dir = hostRoot
  while (true) {
    const candidate = path.resolve(dir, 'node_modules', packageName)
    if (fs.existsSync(path.resolve(candidate, 'package.json')))
      return fs.realpathSync(candidate)
    const parent = path.dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

function readPackageExports(root: string): Record<string, unknown> {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), 'utf8'))
  if (!pkg.exports)
    throw new Error(`[plugin-discovery] ${root} 缺少 package.json exports`)
  return pkg.exports as Record<string, unknown>
}

/** 清单声明的能力必须在包里真实存在。缺了直接构建失败，不留运行时兜底。 */
function assertSubpath(entry: IPluginCatalogEntry, exportsMap: Record<string, unknown>, subpath: string): void {
  if (!(subpath in exportsMap)) {
    throw new Error(
      `[plugin-discovery] 插件 ${entry.id} (${entry.package}) 未导出 ${subpath}，`
      + '请在包的 package.json exports 中补齐，或从清单移除对应能力声明',
    )
  }
}

function buildMainsCode(entries: readonly IPluginCatalogEntry[]): string {
  const loaders = entries
    .map(entry => `  ${JSON.stringify(entry.id)}: () => import(${JSON.stringify(`${entry.package}/main`)}),`)
    .join('\n')
  return `export const pluginLoaders = {\n${loaders}\n}\n`
}

function buildPreloadsCode(entries: readonly IPluginCatalogEntry[]): string {
  const withPreload = entries.filter(entry => entry.preload)
  const imports = withPreload
    .map(entry => `import { createPreloadModule as p_${entry.id} } from ${JSON.stringify(`${entry.package}/preload`)}`)
    .join('\n')
  const factories = withPreload
    .map(entry => `  ${JSON.stringify(entry.preload)}: p_${entry.id},`)
    .join('\n')
  return `${imports}\n\nexport const pluginPreloadFactories = {\n${factories}\n}\n`
}

function buildRenderersCode(entries: readonly IPluginCatalogEntry[]): string {
  const withRenderer = entries.filter(entry => entry.renderer)
  const imports = withRenderer
    .map(entry => `import * as r_${entry.id} from ${JSON.stringify(`${entry.package}/renderer`)}`)
    .join('\n')
  const modules = withRenderer
    .map(entry => `  ${JSON.stringify(entry.id)}: r_${entry.id},`)
    .join('\n')
  return `${imports}\n\nexport const pluginRenderers = {\n${modules}\n}\n`
}

export function discoverPlugins(command: 'serve' | 'build'): IPluginDiscovery {
  const condition = command === 'serve' ? 'development' : 'default'
  const entries: IPluginCatalogEntry[] = []
  const aliases: ViteAlias[] = []
  const roots: string[] = []

  for (const entry of PLUGIN_CATALOG) {
    if (!entry.enabled)
      continue

    const root = entry.root
      ? (() => {
          const candidate = path.resolve(hostRoot, entry.root!)
          return fs.existsSync(path.resolve(candidate, 'package.json')) ? candidate : null
        })()
      : findInstalledPackageRoot(entry.package)

    if (!root) {
      if (entry.optional)
        continue
      throw new Error(`[plugin-discovery] 必要插件 ${entry.id} 不存在：${entry.package}`)
    }

    const exportsMap = readPackageExports(root)
    assertSubpath(entry, exportsMap, './main')
    if (entry.preload)
      assertSubpath(entry, exportsMap, './preload')
    if (entry.renderer)
      assertSubpath(entry, exportsMap, './renderer')

    // 仓库外包不在 node_modules 里，靠 exports 展开成 alias；workspace 包交给 Vite 正常解析
    if (entry.root)
      aliases.push(...aliasesFromExports(entry.package, root, exportsMap, condition))
    roots.push(root)
    entries.push(entry)
  }

  return {
    entries,
    aliases,
    roots,
    mainsCode: buildMainsCode(entries),
    preloadsCode: buildPreloadsCode(entries),
    renderersCode: buildRenderersCode(entries),
  }
}

export function pluginDiscovery(state: IPluginDiscovery): Plugin {
  return {
    name: 'beaver-plugin-discovery',
    resolveId(id) {
      if (id === VIRTUAL_MAINS || id === VIRTUAL_PRELOADS || id === VIRTUAL_RENDERERS)
        return `${RESOLVED_PREFIX}${id}`
    },
    load(id) {
      if (id === `${RESOLVED_PREFIX}${VIRTUAL_MAINS}`)
        return state.mainsCode
      if (id === `${RESOLVED_PREFIX}${VIRTUAL_PRELOADS}`)
        return state.preloadsCode
      if (id === `${RESOLVED_PREFIX}${VIRTUAL_RENDERERS}`)
        return state.renderersCode
    },
  }
}
