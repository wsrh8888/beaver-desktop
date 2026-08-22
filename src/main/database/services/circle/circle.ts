import type { IDBCircle } from 'commonModule/type/database/db/circle'
import { eq, inArray } from 'drizzle-orm'
import { circles } from 'mainModule/database/tables/circle/circles'
import { BaseService } from '../base'

class CircleService extends BaseService {
  async upsert(circle: IDBCircle): Promise<void> {
    await this.db.insert(circles)
      .values(circle)
      .onConflictDoUpdate({
        target: circles.circleId,
        set: {
          name: circle.name,
          avatar: circle.avatar,
          description: circle.description,
          creatorId: circle.creatorId,
          memberCount: circle.memberCount,
          role: circle.role,
          joinType: circle.joinType,
          version: circle.version,
          updatedAt: circle.updatedAt ?? Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  async batchUpsert(items: IDBCircle[]): Promise<void> {
    if (!items.length)
      return
    for (const item of items) {
      const local = await this.getCircleById(item.circleId)
      if (!local || (local.version || 0) !== (item.version || 0))
        await this.upsert(item)
    }
  }

  async getCircleById(circleId: string): Promise<IDBCircle | undefined> {
    return await this.db.select().from(circles).where(eq(circles.circleId as any, circleId as any)).get()
  }

  async getCirclesByIds(circleIds: string[]): Promise<IDBCircle[]> {
    if (!circleIds.length)
      return []
    return await this.db.select().from(circles).where(inArray(circles.circleId as any, circleIds as any)).all()
  }

  async getCircleList(): Promise<IDBCircle[]> {
    return await this.db.select().from(circles).all()
  }
}

export default new CircleService()
