// 数据同步表
export interface IDBDatasync {
  id?: number
  module: string // 业务模块: 'users' | 'friends' | 'groups' | 'chat_*'
  version?: number // 模块版本号或最后序列号
  updatedAt?: number
}
