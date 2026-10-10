/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * grep 工具实现。在工作目录内按正则搜索文件内容，返回 file:line: text。
 * include 按 glob 过滤文件名，结果带 MAX_GREP 上限截断。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'
import { matchInclude, toPosix } from '../shared/glob'
import { walkFiles } from '../shared/walk'

const MAX_GREP = 500

export async function grepFiles(root: string, args: Record<string, any>): Promise<string[]> {
  const pattern = String(args.pattern || '')
  if (!pattern)
    throw new Error('grep pattern required')
  let rx: RegExp
  try {
    rx = new RegExp(pattern)
  }
  catch (err) {
    throw new Error(`invalid regex: ${err instanceof Error ? err.message : String(err)}`)
  }
  const start = resolveInRoot(root, String(args.path || '.'))
  const include = args.include ? String(args.include) : ''
  let stat: fs.Stats
  try {
    stat = await fs.promises.stat(start)
  }
  catch {
    throw new Error(`not found: ${args.path || '.'}`)
  }
  const files = stat.isFile() ? [start] : []
  if (!stat.isFile())
    await walkFiles(start, files)

  const matches: string[] = []
  for (const file of files) {
    const rel = start === file && stat.isFile()
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
      if (!rx.test(lines[i]))
        continue
      matches.push(`${rel}:${i + 1}: ${lines[i]}`)
      if (matches.length >= MAX_GREP) {
        matches.push('(grep 结果截断至 500 行)')
        return matches
      }
    }
  }
  return matches
}
