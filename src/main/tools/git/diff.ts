/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * git_diff 工具实现。薄封装 git diff。
 * cached=true 看暂存区，path 限定到某路径。非 git 仓库或报错时抛出。
 */

import { runBash } from '../shell/bash'

export async function gitDiff(root: string, args: Record<string, any>): Promise<string> {
  const cached = args.cached === true
  const rawPath = args.path ? String(args.path) : ''
  const pathSeg = rawPath ? ` -- ${rawPath}` : ''
  const cmd = `git diff${cached ? ' --cached' : ''}${pathSeg}`
  const r = await runBash(root, cmd, 20)
  if (r.returncode !== 0) {
    const msg = r.stderr.trim() || `git exited ${r.returncode}`
    throw new Error(msg)
  }
  return r.stdout.trim() || '(no changes)'
}
