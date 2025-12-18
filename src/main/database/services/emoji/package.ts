import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { emojiPackage } from 'mainModule/database/tables/emoji/package'
import type {
  DBCreateEmojiPackageReq,
  DBBatchCreateEmojiPackagesReq,
  DBGetEmojiPackagesByIdsReq,
  DBGetEmojiPackagesByIdsRes,
  DBGetPackagesByUserIdReq,
  DBGetPackagesByUserIdRes,
  DBGetAllEmojiPackagesReq,
  DBGetAllEmojiPackagesRes,
  DBGetEmojiPackageByIdReq,
  DBGetEmojiPackageByIdRes,
  DBUpdateEmojiPackageReq,
  DBDeleteEmojiPackageReq,
  DBGetPackageByAutoIdReq,
  DBGetPackageByAutoIdRes,
} from 'commonModule/type/database/server/emoji/package'

// 表情包服务
class EmojiPackage extends BaseService {
  /**
   * @description 创建表情包
   */
  async create(req: DBCreateEmojiPackageReq): Promise<void> {
    await this.db.insert(emojiPackage).values(req).run()
  }

  /**
   * @description 批量创建表情包（upsert操作）
   */
  async batchCreate(req: DBBatchCreateEmojiPackagesReq): Promise<void> {
    if (req.packageList.length === 0) {
      return
    }

    for (const packageData of req.packageList) {
      const result = await this.db.insert(emojiPackage)
        .values(packageData)
        .onConflictDoUpdate({
          target: emojiPackage.packageId,
          set: {
            packageId: packageData.packageId,
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
    }
  }

  /**
   * @description 根据ID列表获取表情包
   */
  async getPackagesByIds(req: DBGetEmojiPackagesByIdsReq): Promise<DBGetEmojiPackagesByIdsRes> {
    if (req.ids.length === 0) {
      return { packages: new Map() }
    }

    const packageList = await this.db
      .select()
      .from(emojiPackage)
      .where(inArray(emojiPackage.packageId, req.ids))

    const packages = new Map<string, IDBEmojiPackage>()
    packageList.forEach((item) => {
      packages.set(item.packageId, item)
    })

    return { packages }
  }

  /**
   * @description 根据用户ID获取用户创建的表情包
   */
  async getPackagesByUserId(req: DBGetPackagesByUserIdReq): Promise<DBGetPackagesByUserIdRes> {
    const packages = await this.db
      .select()
      .from(emojiPackage)
      .where(eq(emojiPackage.userId, req.userId))
      .all()

    return { packages }
  }

  /**
   * @description 获取所有表情包
   */
  async getAllPackages(req: DBGetAllEmojiPackagesReq): Promise<DBGetAllEmojiPackagesRes> {
    const packages = await this.db.select().from(emojiPackage).all()
    return { packages }
  }

  /**
   * @description 根据ID获取单个表情包
   */
  async getPackageById(req: DBGetEmojiPackageByIdReq): Promise<DBGetEmojiPackageByIdRes> {
    const result = await this.db
      .select()
      .from(emojiPackage)
      .where(eq(emojiPackage.packageId, req.id))
      .limit(1)

    return { package: result[0] || null }
  }

  /**
   * @description 根据内部自增ID查询
   */
  async getPackageByAutoId(req: DBGetPackageByAutoIdReq): Promise<DBGetPackageByAutoIdRes> {
    const result = await this.db.select().from(emojiPackage).where(eq(emojiPackage.id, req.id)).limit(1)
    return { package: result[0] || null }
  }
}

export default new EmojiPackage()