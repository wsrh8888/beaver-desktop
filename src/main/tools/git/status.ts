/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * git_status 工具实现。薄封装 git status --short --branch。
 * 非 git 仓库或 git 报错时抛出，由 server 兜底转 isError。
 */

import { runBash } from '../shell/bash'

export async function gitStatus(root: string): Promise<string> {
  const r = await runBash(root, 'git status --short --branch', 15)
  if (r.returncode !== 0) {
    const msg = r.stderr.trim() || r.stdout.trim() || `git exited ${r.returncode}`
    throw new Error(msg)
  }
  return r.stdout.trim() || '(working tree clean)'
}
