/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { IDBDatasync } from 'commonModule/type/database/db/datasync'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 同步游标表 - 用于记录客户端与服务器的同步状态
export const datasync = sqliteTable('datasync', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(), // 业务模块: 'users' | 'friends' | 'groups' | 'chat_*'
  version: integer('version'), // 模块版本号或最后序列号，如果没有则为null
  updatedAt: integer('updated_at').notNull(), // 最后更新时间戳，由外部传入
}, table => ({
  uniqueModule: uniqueIndex('unique_module').on(table.module),
})) as unknown as IDBDatasync
