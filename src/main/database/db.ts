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

import { createRequire } from 'node:module'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath } from 'mainModule/config'
import { createDir } from '../utils/file'
import { initTables } from './tables'

// 使用 createRequire 来避免 __filename 问题
const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')

class DBManager {
  private _db: ReturnType<typeof drizzle> | null = null

  async init(userId: string) {
    if (this._db)
      return this._db
    const filePath = cacheTypeToFilePath[CacheType.USER_DB]
    const databasePath = path.join(getCachePath(), filePath.replace('[userId]', userId), 'database.db')

    // 确保数据库目录存在
    await createDir(path.dirname(databasePath))

    const sqlite = new Database(databasePath)

    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('synchronous = NORMAL')

    this._db = drizzle(sqlite)

    // 初始化表结构
    initTables(this._db)

    return this._db
  }

  get db() {
    if (!this._db) {
      throw new Error('Database not initialized')
    }
    return this._db
  }

  getDB() {
    return this._db
  }

  close() {
    if (this._db) {
      try {
        this._db.$client.close()
        this._db = null
        console.log('Database connection closed successfully')
      }
      catch (error) {
        console.error('Error closing database connection:', error)
        throw error
      }
    }
  }
}

export default new DBManager()
