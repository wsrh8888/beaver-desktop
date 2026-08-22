// 圈子表 (与服务器端 circle_models.CircleModel 对齐的本地展示字段)
export interface IDBCircle {
  id?: number
  circleId: string
  name: string
  avatar?: string
  description?: string
  creatorId?: string
  memberCount?: number
  role?: number
  joinType?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}
