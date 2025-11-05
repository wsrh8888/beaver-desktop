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

      // 更新本地同步状态
      const memberGroups = new Set(members.map((m: any) => m.groupId))
      for (const groupId of memberGroups) {
        const groupMembers = members.filter((m: any) => m.groupId === groupId)
        const maxMemberVersion = groupMembers.length > 0
          ? Math.max(...groupMembers.map((m: any) => m.version))
          : 0

        await GroupSyncStatusService.upsertGroupSyncStatus(
          groupId,
          0, // 保持群资料版本不变
          maxMemberVersion, // 更新成员版本
          0, // 保持申请版本不变
        )
      }
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
