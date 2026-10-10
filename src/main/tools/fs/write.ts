/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * write_file 工具实现。写入工作目录内文件（覆盖），自动建父目录。
 */

import fs from 'node:fs'
import path from 'node:path'
import { resolveInRoot } from '../shared/root'

export async function writeFile(root: string, input: string, content: string): Promise<void> {
  const file = resolveInRoot(root, input)
  await fs.promises.mkdir(path.dirname(file), { recursive: true })
  await fs.promises.writeFile(file, content, 'utf8')
}
