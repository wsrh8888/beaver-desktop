/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 打破 BaseService ↔ db 循环，且避免打包后 createRequire(相对路径) 失效。
 * db.ts 加载末尾 bind；Service / plugin/bind 只读这里。
 */
type DbManagerLike = {
  readonly db: any
}

let manager: DbManagerLike | null = null

export function bindDbManager(next: DbManagerLike): void {
  manager = next
}

export function getDb(): any {
  if (!manager) {
    throw new Error('Database manager 尚未绑定')
  }
  return manager.db
}
