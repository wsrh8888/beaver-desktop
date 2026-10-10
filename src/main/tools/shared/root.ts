/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 工作目录 root 的越界防护。所有 root-bound 工具（fs/search 类）共用，
 * 确保传入的相对路径解析后仍在 root 内，禁止 `..` 逃逸。
 */

import path from 'node:path'

export function assertRoot(root: string): string {
  if (!root || !path.isAbsolute(root))
    throw new Error('workspace root must be an absolute path')
  return path.resolve(root)
}

export function resolveInRoot(root: string, input: string): string {
  const raw = input || '.'
  const target = path.resolve(root, raw)
  const rel = path.relative(root, target)
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || rel.startsWith('../') || path.isAbsolute(rel))
    throw new Error(`path escapes workspace: ${input}`)
  return target
}
