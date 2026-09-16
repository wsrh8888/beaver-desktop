/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 插件建表回调（宿主 initTables 遍历执行） */
export type TableInitFn = (db: any) => void

const inits: TableInitFn[] = []

/** 插件自注册建表（宿主不点名业务包） */
export function registerTableInit(fn: TableInitFn): void {
  if (!inits.includes(fn))
    inits.push(fn)
}

export function getRegisteredTableInits(): readonly TableInitFn[] {
  return inits
}
