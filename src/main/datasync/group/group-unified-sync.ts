import { SyncStatus } from 'commonModule/type/datasync'
import { datasyncGetSyncGroupInfoApi, datasyncGetSyncGroupMembersApi, datasyncGetSyncGroupRequestsApi } from 'mainModule/api/datasync'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupService } from 'mainModule/database/services/group/group'
import { GroupJoinRequestService } from 'mainModule/database/services/group/group-join-request'
import { GroupMemberService } from 'mainModule/database/services/group/group-member'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import groupJoinRequestSync from './group-join-request-sync'
import groupMemberSync from './group-member-sync'
import groupSync from './group-sync'

interface SyncPlan {
  groupsToSync: string[] // 需要同步资料的群组ID
  membersToSync: string[] // 需要同步成员的群组ID
  requestsToSync: string[] // 需要同步申请的群组ID
  groupsToDelete: string[] // 需要删除的群组（退群/解散）
}

// 统一群组同步管理器（按照你的设计：每次登录刷版本 → 对比本地 → 分发到各个同步器）
export class GroupUnifiedSyncManager {
  syncStatus: SyncStatus = SyncStatus.PENDING
  private serverTimestamp: number = 0
  private lastSyncTime: number = 0

  // 检查并同步所有群组数据
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      this.syncStatus = SyncStatus.SYNCING
      console.error('数据库同步1')

      // 第一步：获取本地最后同步时间
      this.lastSyncTime = await DataSyncService.get('groups').then(cursor => cursor?.version || 0).catch(() => 0)
      console.error('数据库同步2')
      // 第二步：获取服务器群组版本信息
      const serverVersions = await this.fetchServerGroupVersions(userId)
      console.error('数据库同步3')

      // 第三步：对比本地状态，决定需要同步哪些群组
      const syncPlan = await this.calculateSyncPlan(serverVersions)
      console.error('数据库同步4', syncPlan)

      // 第四步：执行同步计划
      await this.executeSyncPlan(syncPlan, serverVersions)
      console.error('数据库同步5')

      // 第五步：更新本地同步时间
      await this.updateLocalSyncTime()

      console.error('数据库同步6')
      this.syncStatus = SyncStatus.COMPLETED
      logger.info({ text: '统一群组同步完成' }, 'GroupUnifiedSyncManager')
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '统一群组同步失败', data: { error: (error as any)?.message } }, 'GroupUnifiedSyncManager')
    }
  }

  // 获取服务器群组版本信息
  private async fetchServerGroupVersions(_userId: string) {
    // 并行调用3个API获取不同类型的版本信息
    const [infoResponse, membersResponse, requestsResponse] = await Promise.all([
      datasyncGetSyncGroupInfoApi({ since: this.lastSyncTime }),
      datasyncGetSyncGroupMembersApi({ since: this.lastSyncTime }),
      datasyncGetSyncGroupRequestsApi({ since: this.lastSyncTime }),
    ])

    // 保存服务端时间戳，用于更新本地同步时间（取最大的时间戳）
    this.serverTimestamp = Math.max(
      infoResponse.result.serverTimestamp || 0,
      membersResponse.result.serverTimestamp || 0,
      requestsResponse.result.serverTimestamp || 0,
    ) || Date.now()

    // 合并3个API的结果
    const groupMap = new Map<string, any>()

    // 处理群组信息版本
    infoResponse.result.groupVersions?.forEach((item) => {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, { groupId: item.groupId })
      }
      groupMap.get(item.groupId).groupVersion = item.version
    })

    // 处理群成员版本
    membersResponse.result.groupVersions?.forEach((item) => {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, { groupId: item.groupId })
      }
      groupMap.get(item.groupId).memberVersion = item.version
    })

    // 处理入群申请版本
    requestsResponse.result.groupVersions?.forEach((item) => {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, { groupId: item.groupId })
      }
      groupMap.get(item.groupId).requestVersion = item.version
    })

    return Array.from(groupMap.values())
  }

  // 计算同步计划
  private async calculateSyncPlan(serverVersions: any[]): Promise<SyncPlan> {
    const localStatuses = await GroupSyncStatusService.getAllGroupsSyncStatus()
    const localStatusMap = new Map(localStatuses.map(s => [s.groupId, s]))

    const syncPlan: SyncPlan = {
      groupsToSync: [],
      membersToSync: [],
      requestsToSync: [],
      groupsToDelete: [],
    }

    // 对比服务器版本和本地状态
    for (const serverGroup of serverVersions) {
      const localStatus = localStatusMap.get(serverGroup.groupId)

      // 新群组或版本有变化
      if (!localStatus) {
        // 新群组：全量同步
        syncPlan.groupsToSync.push(serverGroup.groupId)
        syncPlan.membersToSync.push(serverGroup.groupId)
        syncPlan.requestsToSync.push(serverGroup.groupId)
      }
      else {
        // 已有群组：检查各数据域版本
        if ((localStatus.groupVersion || 0) < serverGroup.groupVersion) {
          syncPlan.groupsToSync.push(serverGroup.groupId)
        }
        if ((localStatus.memberVersion || 0) < serverGroup.memberVersion) {
          syncPlan.membersToSync.push(serverGroup.groupId)
        }
        if ((localStatus.requestVersion || 0) < serverGroup.requestVersion) {
          syncPlan.requestsToSync.push(serverGroup.groupId)
        }
      }

      // 从本地状态Map中移除已处理的群组
      localStatusMap.delete(serverGroup.groupId)
    }

    // 剩余的本地群组需要删除（退群/解散）
    syncPlan.groupsToDelete = Array.from(localStatusMap.keys())

    logger.info({
      text: '同步计划计算完成',
      data: {
        serverGroups: serverVersions.length,
        localGroups: localStatuses.length,
        groupsToSync: syncPlan.groupsToSync.length,
        membersToSync: syncPlan.membersToSync.length,
        requestsToSync: syncPlan.requestsToSync.length,
        groupsToDelete: syncPlan.groupsToDelete.length,
      },
    }, 'GroupUnifiedSyncManager')

    return syncPlan
  }

  // 执行同步计划
  private async executeSyncPlan(syncPlan: SyncPlan, serverVersions: any[]) {
    // 1. 删除退群/解散的群组
    if (syncPlan.groupsToDelete.length > 0) {
      await this.deleteGroups(syncPlan.groupsToDelete)
    }

    // 2. 同步群资料
    if (syncPlan.groupsToSync.length > 0) {
      await groupSync.syncGroups(syncPlan.groupsToSync)
    }

    // 3. 同步群成员
    if (syncPlan.membersToSync.length > 0) {
      await groupMemberSync.syncMembers(syncPlan.membersToSync)
    }

    // 4. 同步入群申请
    if (syncPlan.requestsToSync.length > 0) {
      await groupJoinRequestSync.syncRequests(syncPlan.requestsToSync)
    }

    // 5. 更新同步状态版本
    await this.updateSyncVersions(serverVersions)
  }

  // 更新同步版本状态
  private async updateSyncVersions(serverVersions: any[]) {
    for (const serverVersion of serverVersions) {
      await GroupSyncStatusService.upsertGroupSyncStatus(
        serverVersion.groupId,
        serverVersion.groupVersion,
        serverVersion.memberVersion,
        serverVersion.requestVersion,
      )
    }

    logger.info({ text: '同步版本状态更新完成', data: { count: serverVersions.length } }, 'GroupUnifiedSyncManager')
  }

  // 删除群组（退群/解散）
  private async deleteGroups(groupIds: string[]) {
    for (const groupId of groupIds) {
      await GroupService.deleteGroup(groupId)
      await GroupMemberService.deleteGroupMembers(groupId)
      await GroupJoinRequestService.deleteGroupRequests(groupId)
      await GroupSyncStatusService.deleteGroupSyncStatus(groupId)
    }

    logger.info({ text: '删除退群/解散群组', data: { count: groupIds.length } }, 'GroupUnifiedSyncManager')
  }

  async getStatus() {
    return this.syncStatus
  }

  // 更新本地同步时间
  private async updateLocalSyncTime() {
    if (this.serverTimestamp > 0) {
      await DataSyncService.upsert({
        module: 'groups',
        version: this.serverTimestamp,
      }).catch(() => {})
    }
  }
}

// 导出统一群组同步管理器实例
export default new GroupUnifiedSyncManager()
