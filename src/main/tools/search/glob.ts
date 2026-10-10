/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * glob 工具实现。在工作目录内按 glob 模式匹配文件路径。
 */

import { resolveInRoot } from '../shared/root'
import { matchGlob, toPosix } from '../shared/glob'
import { walkFiles } from '../shared/walk'

export async function globFiles(root: string, pattern: string): Promise<string[]> {
  if (!pattern)
    throw new Error('glob pattern required')
  const files: string[] = []
  await walkFiles(root, files)
  return files
    .map(file => toPosix(root, file))
    .filter(rel => matchGlob(rel, pattern))
    .sort()
}
