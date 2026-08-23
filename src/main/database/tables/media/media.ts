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

import type { IDBMedia } from 'commonModule/type/database/db/media'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// 媒体表
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(), // 完整远程 URL
  md5: text('md5'), // 文件内容 MD5
  path: text('path').notNull(), // 文件相对路径或绝对路径
  type: text('type').notNull(), // 媒体类型：image/video/voice/file/avatar/emoticon/temp/thumbnail
  size: integer('size'), // 文件大小（字节）
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
  isDeleted: integer('is_deleted').default(0),
}, table => ({
  urlIdx: unique().on(table.url),
})) as unknown as IDBMedia
