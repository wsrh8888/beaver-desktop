/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { getMainRuntime } from '../../bind'

/**
 * 能力包数据库 Service 基类（对齐原 mainModule/database/services/base）
 * db 实现仍在宿主，经 bindMain({ database: { getDb } }) 注入。
 */
export abstract class BaseService {
  protected get db() {
    return getMainRuntime().database.getDb()
  }
}
