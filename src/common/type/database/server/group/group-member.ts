// 群成员服务请求和响应类型定义

import type { IDBGroupMember } from '../../db/group'

// ===== 群成员操作 =====

/**
 * @description 添加群成员请求
 */
export interface DBAddGroupMemberReq extends Omit<IDBGroupMember, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量添加群成员请求
 */
export interface DBBatchAddGroupMembersReq {
  members: Omit<IDBGroupMember, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取群成员列表请求
 */
export interface DBGetGroupMembersReq {
  groupId: string
}

/**
 * @description 获取群成员列表响应
 */
export interface DBGetGroupMembersRes {
  members: IDBGroupMember[]
}

/**
 * @description 更新群成员信息请求
 */
export interface DBUpdateGroupMemberReq {
  groupId: string
  userId: string
  updateData: Partial<Omit<IDBGroupMember, 'id' | 'createdAt'>>
}

/**
 * @description 移除群成员请求
 */
export interface DBRemoveGroupMemberReq {
  groupId: string
  userId: string
}

/**
 * @description 获取群成员列表请求
 */
export interface DBGetGroupMembersReq {
  groupId: string
}

/**
 * @description 获取群成员列表响应
 */
export interface DBGetGroupMembersRes {
  members: IDBGroupMember[]
}

/**
 * @description 获取用户加入的群组成员记录请求
 */
export interface DBGetUserMembershipsReq {
  userId: string
}

/**
 * @description 获取用户加入的群组成员记录响应
 */
export interface DBGetUserMembershipsRes {
  memberships: IDBGroupMember[]
}