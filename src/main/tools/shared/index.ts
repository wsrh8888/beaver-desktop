/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** shared 能力出口：root 越界防护、glob 模式匹配、目录遍历。供各工具内部复用。 */

export { assertRoot, resolveInRoot } from './root'
export { globToRegExp, matchGlob, matchInclude, toPosix } from './glob'
export { walkFiles } from './walk'
