// 群组表
export interface IDBGroup {
  id?: number
  uuid: string
  type?: number
  title: string
  fileName?: string
  creatorId: string
  notice?: string
  joinType?: number
  status?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}

// 群成员表
export interface IDBGroupMember {
  id?: number
  groupId: string
  userId: string
  role?: number
  status?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}

// 入群申请表
export interface IDBGroupJoinRequest {
  id?: number
  groupId: string
  applicantUserId: string
  message?: string
  status?: number
  handledBy?: string
  handledAt?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}

// 群组同步状态表
export interface IDBGroupSyncStatus {
  id?: number
  groupId: string
  groupVersion?: number
  memberVersion?: number
  requestVersion?: number
  createdAt?: number
  updatedAt?: number
}
