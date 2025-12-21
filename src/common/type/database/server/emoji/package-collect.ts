// 表情包收藏服务请求和响应类型定义

import type { IDBEmojiPackageCollect } from '../../db/emoji'

// ===== 表情包收藏操作 =====

/**
 * @description 创建表情包收藏请求
 */
export interface DBCreatePackageCollectReq extends Omit<IDBEmojiPackageCollect, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情包收藏请求
 */
export interface DBBatchCreatePackageCollectsReq {
  collects: Omit<IDBEmojiPackageCollect, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据用户ID获取收藏的表情包请求
 */
export interface DBGetCollectsByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取收藏的表情包响应
 */
export interface DBGetCollectsByUserIdRes {
  collects: IDBEmojiPackageCollect[]
}

/**
 * @description 根据ID列表获取表情包收藏请求
 */
export interface DBGetPackageCollectsByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情包收藏响应
 */
export type DBGetPackageCollectsByIdsRes = Map<string, IDBEmojiPackageCollect>

/**
 * @description 根据用户ID获取用户的所有表情包收藏请求
 */
export interface DBGetPackageCollectsByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取用户的所有表情包收藏响应
 */
export type DBGetPackageCollectsByUserIdRes = IDBEmojiPackageCollect[]

/**
 * @description 根据ID获取单个表情包收藏请求
 */
export interface DBGetPackageCollectByIdReq {
  packageCollectId: string
}

/**
 * @description 根据ID获取单个表情包收藏响应
 */
export type DBGetPackageCollectByIdRes = IDBEmojiPackageCollect | null

/**
 * @description 删除表情包收藏请求
 */
export interface DBDeletePackageCollectReq {
  userId: string
  packageId: string
}
