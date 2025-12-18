// 群组服务请求和响应类型定义

import type { IDBGroup } from '../../db/group'

// ===== 群组操作 =====

/**
 * @description 创建群组请求
 */
export interface DBCreateGroupReq extends Omit<IDBGroup, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 创建或更新群组请求
 */
export interface DBUpsertGroupReq extends Omit<IDBGroup, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 获取群组信息请求
 */
export interface DBGetGroupReq {
  groupId: string
}

/**
 * @description 获取群组信息响应
 */
export interface DBGetGroupRes {
  group?: IDBGroup | null
}

/**
 * @description 更新群组信息请求
 */
export interface DBUpdateGroupReq {
  groupId: string
  updateData: Partial<Omit<IDBGroup, 'id' | 'createdAt'>>
}

/**
 * @description 删除群组请求
 */
export interface DBDeleteGroupReq {
  groupId: string
}

/**
 * @description 获取用户加入的群组请求
 */
export interface DBGetUserGroupsReq {
  userId: string
}

/**
 * @description 获取用户加入的群组响应
 */
export interface DBGetUserGroupsRes {
  groups: IDBGroup[]
}

/**
 * @description 批量创建群组请求
 */
export interface DBBatchCreateGroupsReq {
  groups: Omit<IDBGroup, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 批量插入或更新群组请求
 */
export interface DBBatchUpsertGroupsReq {
  groups: Omit<IDBGroup, 'id' | 'createdAt' | 'updatedAt'>[]
}