/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IDataSyncModule } from '@beaver-im/beaver'

const modules: IDataSyncModule[] = []

/** 插件自注册同步模块（宿主 DataSyncManager 只跑注册列表，不点名业务包） */
export function registerDataSync(mod: IDataSyncModule): void {
  if (!modules.includes(mod))
    modules.push(mod)
}

export function getRegisteredDataSync(): readonly IDataSyncModule[] {
  return modules
}
