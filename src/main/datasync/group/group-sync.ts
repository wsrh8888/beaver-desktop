import { groupSyncApi } from 'mainModule/api/group'
import { GroupService } from 'mainModule/database/services/group/group'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import logger from 'mainModule/utils/log'

// 群资料同步器（对应服务器group表）
class GroupSync {
  // 同步群资料
  async syncGroups(groupIds: string[]) {
    // 构造包含版本信息的请求
    const groupsWithVersion = await this.buildGroupVersionItems(groupIds, 'groupVersion')
    const response = await groupSyncApi({ groups: groupsWithVersion })
    const groups = response.result.groups

    if (groups.length > 0) {
      // 转换为本地格式
      const localGroups = groups.map((group: any) => ({
        groupId: group.groupId,
        title: group.title,
        avatar: group.avatar, // 头像文件名
        creatorId: group.creatorId,
        joinType: group.joinType,
        status: group.isDeleted ? 0 : 1,
        version: group.version,
        createdAt: group.createAt,
        updatedAt: group.updateAt,
      }))

      await GroupService.batchUpsert(localGroups)

      // 注意：版本状态更新由统一同步器负责，这里不更新
    }

    logger.info({ text: '群资料同步完成', data: { count: groups.length } }, 'GroupSync')
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

// 导出群资料同步器实例
export default new GroupSync()
