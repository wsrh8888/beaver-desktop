// 表情包表情关联服务请求和响应类型定义

import type { IDBEmojiPackageEmoji } from '../../db/emoji'

// ===== 表情包表情关联操作 =====

/**
 * @description 创建表情包表情关联请求
 */
export interface DBCreatePackageEmojiReq extends Omit<IDBEmojiPackageEmoji, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情包表情关联请求
 */
export interface DBBatchCreatePackageEmojisReq {
  relations: Omit<IDBEmojiPackageEmoji, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据表情包ID获取表情列表请求
 */
export interface DBGetEmojisByPackageIdReq {
  packageId: string
}

/**
 * @description 根据表情包ID获取表情列表响应
 */
export interface DBGetEmojisByPackageIdRes {
  emojis: IDBEmojiPackageEmoji[]
}

/**
 * @description 根据表情包ID列表获取表情关联数据请求
 */
export interface DBGetEmojisByPackageIdsReq {
  packageIds: string[]
}

/**
 * @description 根据表情包ID列表获取表情关联数据响应
 */
export interface DBGetEmojisByPackageIdsRes {
  relations: Map<string, IDBEmojiPackageEmoji[]>
}

/**
 * @description 根据表情ID获取所属的表情包请求
 */
export interface DBGetPackagesByEmojiIdReq {
  emojiId: string
}

/**
 * @description 根据表情ID获取所属的表情包响应
 */
export interface DBGetPackagesByEmojiIdRes {
  packages: IDBEmojiPackageEmoji[]
}

/**
 * @description 删除表情包中的表情请求
 */
export interface DBDeleteByPackageIdAndEmojiIdReq {
  packageId: string
  emojiId: string
}

/**
 * @description 删除表情包中的所有表情请求
 */
export interface DBDeleteByPackageIdReq {
  packageId: string
}
