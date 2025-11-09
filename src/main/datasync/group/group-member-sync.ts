import { groupMemberSyncApi } from 'mainModule/api/group'
import { GroupMemberService } from 'mainModule/database/services/group/group-member'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import logger from 'mainModule/utils/log'

// 群成员同步器
class GroupMemberSync {
  // 同步群成员
  async syncMembers(groupIds: string[]) {
    // 构造包含版本信息的请求
    const groupsWithVersion = await this.buildGroupVersionItems(groupIds, 'memberVersion')
    const response = await groupMemberSyncApi({ groups: groupsWithVersion })
    const members = response.result.groupMembers

    if (members.length > 0) {
      await GroupMemberService.batchCreate(members)

      // 注意：版本状态更新由统一同步器负责，这里不更新
    }

    logger.info({ text: '群成员同步完成', data: { count: members.length } }, 'GroupMemberSync')
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

// 导出群成员同步器实例
export default new GroupMemberSync()
