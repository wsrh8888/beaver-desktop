/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { eq } from 'drizzle-orm'
import { BaseService, Logger } from '@beaver-im/beaver/main'
import { circleSyncStatus } from '../../tables/circle/sync-status'

const logger = new Logger('circle-sync-status')

const MODULE = 'circles'

class CircleSyncStatusService extends BaseService {
  async getVersion(): Promise<number> {
    try {
      const row = await this.db.select().from(circleSyncStatus)
        .where(eq(circleSyncStatus.module as any, MODULE))
        .get()
      return row?.version || 0
    }
    catch (error) {
      logger.error({ text: '获取圈子同步游标失败', data: { error: (error as any)?.message } })
      return 0
    }
  }

  async upsert(version: number, updatedAt: number): Promise<void> {
    try {
      const existing = await this.db.select().from(circleSyncStatus)
        .where(eq(circleSyncStatus.module as any, MODULE))
        .get()

      if (existing) {
        await this.db.update(circleSyncStatus)
          .set({ version, updatedAt })
          .where(eq(circleSyncStatus.id as any, existing.id))
          .run()
        return
      }

      await this.db.insert(circleSyncStatus).values({
        module: MODULE,
        version,
        updatedAt,
      }).run()
    }
    catch (error) {
      logger.error({ text: '更新圈子同步游标失败', data: { error: (error as any)?.message } })
    }
  }
}

export default new CircleSyncStatusService()
