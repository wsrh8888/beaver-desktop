/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 宿主核心库 Service 与能力包统一使用 @beaver-im/beaver 的 BaseService。
 * db 经 bindMain({ database: { getDb } }) 注入，避免与 db/initTables 静态循环依赖。
 */
export { BaseService } from '@beaver-im/beaver/main'
