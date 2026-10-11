/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * str_replace 工具实现。在工作目录内文件中替换字符串。
 * 默认要求 old 唯一，replace_all=true 可多处替换。
 */

import fs from 'node:fs'
import { resolveWriteInRoot } from '../shared/root'
import { writeFile } from './write'

export async function strReplace(root: string, args: Record<string, any>): Promise<void> {
  const input = String(args.path || '')
  const old = String(args.old ?? '')
  const next = String(args.new ?? '')
  if (!old)
    throw new Error('old string is empty')
  const file = resolveWriteInRoot(root, input)
  const stat = await fs.promises.stat(file)
  if (!stat.isFile())
    throw new Error(`not a file: ${input}`)
  const text = await fs.promises.readFile(file, 'utf8')
  const count = text.split(old).length - 1
  if (count === 0)
    throw new Error(`old string not found in ${input}`)
  const replaceAll = args.replace_all === true || args.replaceAll === true
  if (!replaceAll && count > 1)
    throw new Error(`old string appears ${count} times in ${input}; 需更长上下文唯一匹配或 replace_all=true`)
  const replaced = replaceAll ? text.split(old).join(next) : text.replace(old, next)
  await writeFile(root, input, replaced)
}
