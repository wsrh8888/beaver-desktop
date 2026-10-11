/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 工作目录 root 解析。相对路径必须落在 root 内，禁止 `..` 逃逸。
 * 本机绝对路径（如 D:\）直接使用，工作空间对话可以查看其它目录。
 */

import path from 'node:path'

export function assertRoot(root: string): string {
  if (!root || !path.isAbsolute(root))
    throw new Error('workspace root must be an absolute path')
  return path.resolve(root)
}

export function resolveInRoot(root: string, input: string): string {
  const raw = (input || '.').trim() || '.'
  // D: 在 Node 里不算绝对路径，但 path.resolve 会落到该盘根目录
  if (path.isAbsolute(raw) || /^[a-z]:/i.test(raw))
    return path.resolve(raw)
  const target = path.resolve(root, raw)
  const rel = path.relative(root, target)
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || rel.startsWith('../') || path.isAbsolute(rel))
    throw new Error(`path escapes workspace: ${input}`)
  return target
}

/** 写入必须落在工作空间内。绝对路径若在根目录下则规范化，否则拒绝。 */
export function resolveWriteInRoot(root: string, input: string): string {
  const base = assertRoot(root)
  const raw = (input || '').trim()
  if (!raw || raw === '.')
    throw new Error('write path required')
  const target = (path.isAbsolute(raw) || /^[a-z]:/i.test(raw))
    ? path.resolve(raw)
    : path.resolve(base, raw)
  const rel = path.relative(base, target)
  if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || rel.startsWith('../') || path.isAbsolute(rel))
    throw new Error(`write path must stay inside workspace: ${input}`)
  return target
}
