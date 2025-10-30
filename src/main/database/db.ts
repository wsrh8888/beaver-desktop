import { createRequire } from 'node:module'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath } from 'mainModule/config'
import { initTables } from './tables'

// 使用 createRequire 来避免 __filename 问题
const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')

class DBManager {
  private _db: ReturnType<typeof drizzle> | null = null

  init(userId: string) {
    if (this._db)
      return this._db
    const filePath = cacheTypeToFilePath[CacheType.USER_DB]
    const databasePath = path.join(getCachePath(), filePath.replace('[userId]', userId), 'database.db')
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
