import { datasyncGetSyncGroupMembersApi } from 'mainModule/api/datasync'
import { groupMemberSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupMemberService } from 'mainModule/database/services/group/group-member'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import Logger from 'mainModule/utils/logger/index'

const logger = new Logger('数据同步-group-member')

// 群成员同步器
class GroupMemberSync {
  // 检查并同步群成员
  async checkAndSync() {
    logger.info({ text: '开始同步群成员数据' })
    try {
      // 获取本地最后同步时间
      const lastSyncTime = await DataSyncService.get('group_members').then(cursor => cursor?.version || 0).catch(() => 0)

      // 获取服务器上变更的群成员版本信息
      const serverResponse = await datasyncGetSyncGroupMembersApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的群组
      const needUpdateGroups = await this.compareAndFilterMemberVersions(serverResponse.result.groupVersions)

      if (needUpdateGroups.length > 0) {
        // 有需要更新的群成员
        await this.syncMemberData(needUpdateGroups)
      }

      // 更新游标（无论是否有变更都要更新）
      await DataSyncService.upsert({
        module: 'group_members',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => { })
    }
    catch (error) {
      logger.error({ text: '群成员同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的群组信息
  private async compareAndFilterMemberVersions(groupVersions: any[]): Promise<Array<{ groupId: string, version: number }>> {
    if (groupVersions.length === 0) {
      return []
    }

    // 提取所有变更的群组ID
    const groupIds = groupVersions.map(item => item.groupId)

    // 查询本地已存在的群成员版本状态
    const localVersions = await GroupSyncStatusService.getModuleVersions('members', groupIds)
    const localVersionMap = new Map(localVersions.map(v => [v.groupId, v.version]))

    // 过滤出需要更新的群组（本地不存在或版本号更旧的数据）
    const needUpdateGroups = groupVersions.filter((groupVersion) => {
      const localVersion = localVersionMap.get(groupVersion.groupId) || 0
      // 如果服务器版本更新，则需要更新
      return localVersion < groupVersion.version
    })

    return needUpdateGroups
  }

  // 同步群成员数据
  private async syncMemberData(groupsWithVersions: Array<{ groupId: string, version: number }>) {
    if (groupsWithVersions.length === 0) {
      return
    }

    // 直接使用传入的群组版本信息构造请求
    const response = await groupMemberSyncApi({ groups: groupsWithVersions })
    const members = response.result.groupMembers

    if (members.length > 0) {
      await GroupMemberService.batchCreate(members)

      // 更新本地群成员版本状态
      for (const member of members) {
        await GroupSyncStatusService.upsertSyncStatus('members', member.groupId, member.version)
      }
    }
  }
}

// 导出群成员同步器实例
export default new GroupMemberSync()
