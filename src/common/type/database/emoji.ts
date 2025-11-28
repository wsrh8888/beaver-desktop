// 表情表
export interface IDBEmoji {
  id?: number
  uuid: string
  fileKey: string
  title: string
  status?: number // 状态：1=正常 2=审核中 3=违规禁用
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户收藏的表情表
export interface IDBEmojiCollect {
  id?: number
  uuid: string
  userId: string
  emojiId: string // 表情UUID
  isDeleted?: number // 是否已删除（软删除）：0=未删除 1=已删除
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 表情包表
export interface IDBEmojiPackage {
  id?: number
  uuid: string
  title: string
  coverFile?: string
  userId: string
  description?: string
  type: string // 类型：official-官方，user-用户自定义
  status?: number // 状态：1=正常 2=审核中 3=违规禁用
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 表情包与表情的多对多关联表
export interface IDBEmojiPackageEmoji {
  id?: number
  uuid: string
  packageId: string // 表情包UUID
  emojiId: string // 表情UUID
  sortOrder?: number // 在表情包中的排序
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}

// 用户收藏的表情包表
export interface IDBEmojiPackageCollect {
  id?: number
  uuid: string
  userId: string
  packageId: string // 表情包UUID
  isDeleted?: number // 是否已删除（软删除）：0=未删除 1=已删除
  version?: number // 版本号
  createdAt?: number
  updatedAt?: number
}
