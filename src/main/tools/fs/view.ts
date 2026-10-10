/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * view 工具实现。读取工作目录内文件并加行号前缀（1 基绝对行号），
 * 便于 LLM / 用户按行号引用。支持 offset/limit 切片。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'

export async function viewFile(root: string, args: Record<string, any>): Promise<string> {
  const file = resolveInRoot(root, String(args.path || ''))
  const stat = await fs.promises.stat(file)
  if (!stat.isFile())
    throw new Error(`not a file: ${args.path}`)
  const text = await fs.promises.readFile(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const offset = Math.max(Number(args.offset) || 0, 0)
  const limit = Number(args.limit) || 0
  const start = offset
  const end = limit > 0 ? Math.min(start + limit, lines.length) : lines.length
  const width = String(end).length
  const slice = lines.slice(start, end)
  return slice
    .map((line, i) => `${String(start + i + 1).padStart(width)}\t${line}`)
    .join('\n')
}
