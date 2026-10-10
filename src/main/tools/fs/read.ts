/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * read_file 工具实现。读取工作目录内文件，支持 offset/limit 行号切片。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'

export async function readFile(root: string, args: Record<string, any>): Promise<string> {
  const file = resolveInRoot(root, String(args.path || ''))
  const stat = await fs.promises.stat(file)
  if (!stat.isFile())
    throw new Error(`not a file: ${args.path}`)
  const text = await fs.promises.readFile(file, 'utf8')
  const offset = Number(args.offset) || 0
  const limit = Number(args.limit) || 0
  if (offset <= 0 && limit <= 0)
    return text
  const lines = text.split(/\r?\n/)
  const start = Math.max(offset, 0)
  const end = limit > 0 ? start + limit : lines.length
  return lines.slice(start, end).join('\n')
}
