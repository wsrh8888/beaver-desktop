// 导入各表的初始化函数
import { initGroupsTable } from './groups'
import { initGroupJoinRequestsTable } from './join-requests'
import { initGroupMembersTable } from './members'
import { initGroupSyncStatusTable } from './sync-status'

// 群组相关表初始化
export const initGroupTables = (db: any) => {
  const sqlite = db.$client

  // 初始化各个表

  initGroupsTable(sqlite)
  initGroupMembersTable(sqlite)
  initGroupJoinRequestsTable(sqlite)
  initGroupSyncStatusTable(sqlite)
}
