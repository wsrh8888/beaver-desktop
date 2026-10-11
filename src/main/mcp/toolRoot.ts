/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 本机工具的工作目录。MCP schema 不会把内部字段传进工具回调，
 * 所以 root 走这里，不放进模型可见的参数。
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { assertRoot } from 'mainModule/tools/shared'

const current = new AsyncLocalStorage<string>()

export function runWithToolRoot<T>(root: string, fn: () => Promise<T>): Promise<T> {
  return current.run(root, fn)
}

export function requireToolRoot(): string {
  return assertRoot(current.getStore() || '')
}
