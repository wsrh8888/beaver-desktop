import { groupJoinRequestSyncApi } from 'mainModule/api/group'
import { GroupJoinRequestService } from 'mainModule/database/services/group/group-join-request'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import logger from 'mainModule/utils/log'

// 入群申请同步器
class GroupJoinRequestSync {
  // 同步入群申请
  async syncRequests(groupIds: string[]) {
    // 构造包含版本信息的请求
    const groupsWithVersion = await this.buildGroupVersionItems(groupIds, 'requestVersion')
    const response = await groupJoinRequestSyncApi({ groups: groupsWithVersion })
    const requests = response.result.groupJoinRequests

    if (requests.length > 0) {
      await GroupJoinRequestService.batchCreate(requests)

      // 更新本地同步状态
      const requestGroups = new Set(requests.map((r: any) => r.groupId))
      for (const groupId of requestGroups) {
        const groupRequests = requests.filter((r: any) => r.groupId === groupId)
        const maxRequestVersion = groupRequests.length > 0
          ? Math.max(...groupRequests.map((r: any) => r.version))
          : 0

        await GroupSyncStatusService.upsertGroupSyncStatus(
          groupId,
          0, // 保持群资料版本不变
          0, // 保持成员版本不变
          maxRequestVersion, // 更新申请版本
        )
      }
    }

    logger.info({ text: '入群申请同步完成', data: { count: requests.length } }, 'GroupJoinRequestSync')
  }

  // 构造包含版本信息的群组列表
  private async buildGroupVersionItems(groupIds: string[], versionField: 'groupVersion' | 'memberVersion' | 'requestVersion') {
    const localStatuses = await GroupSyncStatusService.getAllGroupsSyncStatus()
    const statusMap = new Map(localStatuses.map(s => [s.groupId, s]))

    return groupIds.map((groupId) => {
      const status = statusMap.get(groupId)
      const version = status ? (status[versionField] || 0) : 0
      return {
        groupId,
        version,
      }
    })
  }
}

// 导出入群申请同步器实例
export default new GroupJoinRequestSync()
