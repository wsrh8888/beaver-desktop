// 好友服务请求和响应类型定义

import type { IDBFriend } from '../../db/friend'

/**
 * @description 创建好友关系请求
 */
export interface DBCreateFriendReq extends Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description upsert好友关系请求
 */
export interface DBUpsertFriendReq extends Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建好友关系请求
 */
export interface DBBatchCreateFriendsReq {
  friends: Omit<IDBFriend, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 批量获取好友详细信息请求
 */
export interface DBGetFriendDetailsReq {
  userId: string
  friendIds: string[]
}

/**
 * @description 批量获取好友详细信息响应
 */
export type DBGetFriendDetailsRes = IDBFriend[]

/**
 * @description 根据好友关系ID列表批量查询好友信息请求
 */
export interface DBGetFriendsByIdsReq {
  friendIds: string[]
  currentUserId: string
}

/**
 * @description 根据好友关系ID列表批量查询好友信息响应
 */
export type DBGetFriendsByIdsRes = IDBFriend[]

/**
 * @description 根据friendshipIds批量查询本地好友关系请求
 */
export interface DBGetFriendRecordsByIdsReq {
  friendshipIds: string[]
}

/**
 * @description 根据friendshipIds批量查询本地好友关系响应
 */
export type DBGetFriendRecordsByIdsRes = Map<string, IDBFriend>

/**
 * @description 获取好友关系记录请求
 */
export interface DBGetFriendRelationsReq {
  userId: string
  options?: {
    page?: number
    limit?: number
  }
}

/**
 * @description 获取好友关系记录响应
 */
export type DBGetFriendRelationsRes = IDBFriend[]

/**
 * @description 根据版本范围获取好友请求
 */
export interface DBGetFriendsByVerRangeReq {
  userId: string
  startVersion?: number
  endVersion?: number
}

/**
 * @description 根据版本范围获取好友响应
 */
export type DBGetFriendsByVerRangeRes = IDBFriend[]