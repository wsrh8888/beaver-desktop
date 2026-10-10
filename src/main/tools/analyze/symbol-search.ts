/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * symbol_search 工具实现。按符号名在工作目录找声明位置（函数/类/接口/类型/const 等）。
 * 比 grep 文本匹配更精确：只命中声明行，不命中调用点。include 按 glob 过滤文件名。
 * 结果带 MAX_SYM 上限截断。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'
import { matchInclude, toPosix } from '../shared/glob'
import { walkFiles } from '../shared/walk'
import { declaredName } from './patterns'

const MAX_SYM = 200

export async function symbolSearch(root: string, args: Record<string, any>): Promise<string[]> {
  const name = String(args.name || '')
  if (!name)
    throw new Error('name required')
  const include = args.include ? String(args.include) : ''
  const scope = args.path ? resolveInRoot(root, String(args.path)) : root

  let stat: fs.Stats
  try {
    stat = await fs.promises.stat(scope)
  }
  catch {
    throw new Error(`not found: ${args.path || '.'}`)
  }
  const files = stat.isFile() ? [scope] : []
  if (!stat.isFile())
    await walkFiles(scope, files)

  const results: string[] = []
  for (const file of files) {
    const rel = scope === file && stat.isFile()
      ? String(args.path || toPosix(root, file))
      : toPosix(root, file)
    if (include && !matchInclude(rel, include))
      continue
    let text = ''
    try {
      text = await fs.promises.readFile(file, 'utf8')
    }
    catch {
      continue
    }
    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      if (declaredName(lines[i]) !== name)
        continue
      results.push(`${rel}:${i + 1}: ${lines[i].trim()}`)
      if (results.length >= MAX_SYM) {
        results.push(`(符号结果截断至 ${MAX_SYM} 条)`)
        return results
      }
    }
  }
  return results
}
