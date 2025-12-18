// 用户服务请求和响应类型定义

import type { IDBUser } from '../../db/user'
import type { IUserInfoRes, IUserSyncItem } from 'commonModule/type/ajax/user'

// ===== 用户基础操作 =====

/**
 * @description 创建用户请求
 */
export interface DBCreateUserReq extends Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 创建或更新用户请求
 */
export interface DBUpsertUserReq extends Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @description 批量创建用户请求
 */
export interface DBBatchCreateUsersReq {
  usersData: Omit<IDBUser, 'id' | 'createdAt' | 'updatedAt'>[]
}

/**
 * @description 获取用户信息请求
 */
export interface DBGetUserByIdReq {
  header: any
  data?: any
}

/**
 * @description 获取用户信息响应
 */
export interface DBGetUserByIdRes {
  userInfo?: IUserInfoRes | null
}

/**
 * @description 获取用户基本信息请求
 */
export interface DBGetUserBasicInfoReq {
  userId: string
}

/**
 * @description 获取用户基本信息响应
 */
export interface DBGetUserBasicInfoRes {
  userInfo?: {
    userId: string
    version: number
  } | null
}

/**
 * @description 批量获取用户基本信息请求
 */
export interface DBGetUsersBasicInfoReq {
  userIds: string[]
}

/**
 * @description 批量获取用户基本信息响应
 */
export type DBGetUsersBasicInfoRes = Array<{
  userId: string
  nickName: string
  avatar: string
}>

/**
 * @description 获取所有用户请求
 */
export interface DBGetAllUsersReq {}

/**
 * @description 获取所有用户响应
 */
export type DBGetAllUsersRes = Array<{
  userId: string
  nickName: string
  avatar: string
  abstract: string
  phone: string
  email: string
  gender: number
  status: number
  version: number
  createAt: number
  updateAt: number
}>