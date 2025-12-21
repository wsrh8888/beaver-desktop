// 表情收藏服务请求和响应类型定义

import type { IDBEmojiCollect } from '../../db/emoji'

// ===== 表情收藏操作 =====

/**
 * @description 创建表情收藏请求
 */
export interface DBCreateEmojiCollectReq extends Omit<IDBEmojiCollect, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情收藏请求
 */
export interface DBBatchCreateEmojiCollectsReq {
  collects: Omit<IDBEmojiCollect, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据ID列表获取表情收藏请求
 */
export interface DBGetEmojiCollectsByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情收藏响应
 */
export type DBGetEmojiCollectsByIdsRes = Map<string, IDBEmojiCollect>

/**
 * @description 根据用户ID获取表情收藏请求
 */
export interface DBGetEmojiCollectsByUserIdReq {
  userId: string
}

/**
 * @description 根据用户ID获取表情收藏响应
 */
export type DBGetEmojiCollectsByUserIdRes = IDBEmojiCollect[]

/**
 * @description 根据ID获取单个表情收藏请求
 */
export interface DBGetEmojiCollectByIdReq {
  id: string
}

/**
 * @description 根据ID获取单个表情收藏响应
 */
export type DBGetEmojiCollectByIdRes = IDBEmojiCollect | null

/**
 * @description 删除表情收藏请求
 */
export interface DBDeleteEmojiCollectReq {
  id: string
}