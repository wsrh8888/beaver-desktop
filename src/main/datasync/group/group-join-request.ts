import { datasyncGetSyncGroupRequestsApi } from 'mainModule/api/datasync'
import { groupJoinRequestSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupJoinRequestService } from 'mainModule/database/services/group/group-join-request'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-群申请')

// 入群申请同步器
class GroupJoinRequestSync {
  // 检查并同步入群申请
  async checkAndSync() {
    logger.info({ text: '开始同步入群申请数据' })
    try {
    // 获取本地最后同步时间
      const lastSyncTime = await DataSyncService.get('group_join_requests').then(cursor => cursor?.version || 0).catch(() => 0)

      // 获取服务器上变更的入群申请版本信息
      const serverResponse = await datasyncGetSyncGroupRequestsApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的群组
      const needUpdateGroups = await this.compareAndFilterRequestVersions(serverResponse.result.groupVersions)

      if (needUpdateGroups.length > 0) {
      // 有需要更新的入群申请
        await this.syncRequestData(needUpdateGroups)
      }

      // 更新游标（无论是否有变更都要更新）
      await DataSyncService.upsert({
        module: 'group_join_requests',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => {})
      logger.info({ text: '入群申请同步完成' })
    }
    catch (error) {
      logger.error({ text: '入群申请同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的群组信息
  private async compareAndFilterRequestVersions(groupVersions: any[]): Promise<Array<{ groupId: string, version: number }>> {
    if (groupVersions.length === 0) {
      return []
    }

    // 提取所有变更的群组ID
    const groupIds = groupVersions.map(item => item.groupId)

    // 查询本地已存在的入群申请版本状态
    const localVersions = await GroupSyncStatusService.getModuleVersions('requests', groupIds)
    const localVersionMap = new Map(localVersions.map(v => [v.groupId, v.version]))

    // 过滤出需要更新的群组，并使用本地版本号（而不是服务器版本号）
    const needUpdateGroups: Array<{ groupId: string, version: number }> = []
    for (const groupVersion of groupVersions) {
      const localVersion = localVersionMap.get(groupVersion.groupId) || 0
      // 如果服务器版本更新，则需要更新
      if (localVersion < groupVersion.version) {
        // 使用本地版本号，这样服务器才能返回 version > localVersion 的变更
        needUpdateGroups.push({
          groupId: groupVersion.groupId,
          version: localVersion, // 使用本地版本号，而不是服务器版本号
        })
      }
    }

    return needUpdateGroups
  }

  // 同步入群申请数据
  private async syncRequestData(groupsWithVersions: Array<{ groupId: string, version: number }>) {
    if (groupsWithVersions.length === 0) {
      return
    }

    // 直接使用传入的群组版本信息构造请求
    const response = await groupJoinRequestSyncApi({ groups: groupsWithVersions })
    const requests = response.result.groupJoinRequests

    if (requests.length > 0) {
      await GroupJoinRequestService.batchCreate(requests)

      // 更新本地入群申请版本状态
      for (const request of requests) {
        await GroupSyncStatusService.upsertSyncStatus('requests', request.groupId, request.version)
      }
    }
  }
}

// 导出入群申请同步器实例
export default new GroupJoinRequestSync()
