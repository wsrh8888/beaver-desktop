import dbManager from '../../db'
import { groups } from '../../tables/group/group'

// 群组服务
export class GroupService {
  static get db() {
    return dbManager.db
  }

  // 创建群组
  static async create(groupData: any) {
    return await this.db.insert(groups).values(groupData).run()
  }

  // 批量创建群组（调用create方法）
  static async batchCreate(groupsData: any[]) {
    if (groupsData.length === 0)
      return

    for (const group of groupsData) {
      await this.create(group)
    }
  }
}
