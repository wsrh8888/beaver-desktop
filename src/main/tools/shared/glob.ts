/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * glob 模式匹配工具。search/glob、search/grep 共用。
 * 支持 `**` 跨目录、`*` 单段、`?` 单字符，其余字符按字面量转义。
 */

import path from 'node:path'

export function toPosix(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/')
}

export function globToRegExp(pattern: string): RegExp {
  let re = ''
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '*' && pattern[i + 1] === '*') {
      if (pattern[i + 2] === '/') {
        re += '(?:.*/)?'
        i += 2
        continue
      }
      re += '.*'
      i += 1
      continue
    }
    const c = pattern[i]
    if (c === '*')
      re += '[^/]*'
    else if (c === '?')
      re += '[^/]'
    else
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${re}$`)
}

export function matchGlob(rel: string, pattern: string): boolean {
  return globToRegExp(pattern).test(rel)
}

export function matchInclude(rel: string, include: string): boolean {
  if (include.includes('/'))
    return matchGlob(rel, include.startsWith('**/') ? include : `**/${include}`)
  const base = rel.split('/').pop() || rel
  return matchGlob(base, include)
}
