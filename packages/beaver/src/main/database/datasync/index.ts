/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { getMainRuntime } from '../../bind'
import type { IDataSyncCursor } from '../../bind'

/** 同步游标门面（实现由宿主 bind） */
export const dataSyncCursor: IDataSyncCursor = {
  get(req) {
    return getMainRuntime().database.dataSyncCursor.get(req)
  },
  upsert(req) {
    return getMainRuntime().database.dataSyncCursor.upsert(req)
  },
}
