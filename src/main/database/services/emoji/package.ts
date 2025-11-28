import { eq, inArray } from 'drizzle-orm'
import dbManager from 'mainModule/database/db'
import { emojiPackage } from 'mainModule/database/tables/emoji/package'

// 表情包服务
export class EmojiPackageService {
  static get db() {
    return dbManager.db
  }

  // 创建表情包
  static async create(packageData: any) {
    return await this.db.insert(emojiPackage).values(packageData).run()
  }

  // 批量创建表情包（upsert操作）
  static async batchCreate(packageList: any[]) {
    if (packageList.length === 0) {
      return
    }

    const results = []
    for (const packageData of packageList) {
      const result = await this.db.insert(emojiPackage)
        .values(packageData)
        .onConflictDoUpdate({
          target: emojiPackage.id,
          set: {
            uuid: packageData.uuid,
            title: packageData.title,
            coverFile: packageData.coverFile,
            userId: packageData.userId,
            description: packageData.description,
            type: packageData.type,
            status: packageData.status,
            version: packageData.version,
            updatedAt: packageData.updatedAt,
          },
        })
        .run()
      results.push(result)
    }

    return results
  }

  // 根据UUID列表获取表情包
  static async getPackagesByIds(uuids: string[]): Promise<Map<string, any>> {
    if (uuids.length === 0) {
      return new Map()
    }

    const packageList = await this.db
      .select()
      .from(emojiPackage)
      .where(inArray(emojiPackage.uuid, uuids))

    const packageMap = new Map<string, any>()
    packageList.forEach((item) => {
      packageMap.set(item.uuid, item)
    })

    return packageMap
  }

  // 根据用户ID获取用户创建的表情包
  static async getPackagesByUserId(userId: string) {
    return await this.db
      .select()
      .from(emojiPackage)
      .where(eq(emojiPackage.userId, userId))
      .all()
  }

  // 获取所有表情包
  static async getAllPackages() {
    return await this.db.select().from(emojiPackage).all()
  }

  // 根据ID获取单个表情包
  static async getPackageById(id: number) {
    const result = await this.db
      .select()
      .from(emojiPackage)
      .where(eq(emojiPackage.id, id))
      .limit(1)

    return result[0] || null
  }

  // 根据UUID获取单个表情包
  static async getPackageByUuid(uuid: string) {
    const result = await this.db
      .select()
      .from(emojiPackage)
      .where(eq(emojiPackage.uuid, uuid))
      .limit(1)

    return result[0] || null
  }
}
