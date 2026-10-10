/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 递归遍历目录收集文件。search/glob、search/grep 共用。
 * 跳过 .git / node_modules，符号链接跳过，带 MAX_WALK 上限截断。
 */

import fs from 'node:fs'
import path from 'node:path'

const MAX_WALK = 4000

export async function walkFiles(dir: string, out: string[]): Promise<void> {
  if (out.length >= MAX_WALK)
    return
  let entries: fs.Dirent[]
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_WALK)
      return
    if (entry.name === '.git' || entry.name === 'node_modules')
      continue
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink())
      continue
    if (entry.isDirectory())
      await walkFiles(full, out)
    else if (entry.isFile())
      out.push(full)
  }
}
