/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * ls 工具实现。列出工作目录内某路径下的直接条目。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'

export async function listFiles(root: string, input: string): Promise<string[]> {
  const dir = resolveInRoot(root, input)
  const stat = await fs.promises.stat(dir)
  if (!stat.isDirectory())
    throw new Error(`not a directory: ${input}`)
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  return entries
    .map(entry => entry.name + (entry.isDirectory() ? '/' : ''))
    .sort()
}
