// 表情服务请求和响应类型定义

import type { IDBEmoji } from '../../db/emoji'

// ===== 表情操作 =====

/**
 * @description 创建表情请求
 */
export interface DBCreateEmojiReq extends Omit<IDBEmoji, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建表情请求
 */
export interface DBBatchCreateEmojisReq {
  emojiList: Omit<IDBEmoji, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 根据ID列表获取表情请求
 */
export interface DBGetEmojisByIdsReq {
  ids: string[]
}

/**
 * @description 根据ID列表获取表情响应
 */
export interface DBGetEmojisByIdsRes {
  emojis: Map<string, IDBEmoji>
}

/**
 * @description 获取所有表情请求
 */
export interface DBGetAllEmojisReq {}

/**
 * @description 获取所有表情响应
 */
export interface DBGetAllEmojisRes {
  emojis: IDBEmoji[]
}

/**
 * @description 根据ID获取单个表情请求
 */
export interface DBGetEmojiByIdReq {
  id: string
}

/**
 * @description 根据ID获取单个表情响应
 */
export interface DBGetEmojiByIdRes {
  emoji?: IDBEmoji | null
}
