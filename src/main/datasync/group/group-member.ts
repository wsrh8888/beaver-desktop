import { NotificationGroupCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { datasyncGetSyncGroupMembersApi } from 'mainModule/api/datasync'
import { groupMemberSyncApi } from 'mainModule/api/group'
import dbServiceDataSync  from 'mainModule/database/services/datasync/datasync'
import dBServiceGroupMember  from 'mainModule/database/services/group/group-member'
import dBServiceGroupSyncStatus from 'mainModule/database/services/group/group-sync-status'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import Logger from 'mainModule/utils/logger/index'

const logger = new Logger('数据同步-group-member')

// 群成员同步器
class GroupMemberSync {
  // 检查并同步群成员
  async checkAndSync() {
    logger.info({ text: '开始同步群成员数据' })
    try {
      // 获取本地最后同步时间
      const lastSyncTime = await dbServiceDataSync.get({ module: 'group_members' }).then(cursor => cursor?.version || 0).catch(() => 0)

      // 获取服务器上变更的群成员版本信息
      const serverResponse = await datasyncGetSyncGroupMembersApi({ since: lastSyncTime })

      console.error('xxxxxxxxxxxxxxxxxxxxxxxxxxx', JSON.stringify(serverResponse.result))

      // 对比本地数据，过滤出需要更新的群组
      const needUpdateGroups = await this.compareAndFilterMemberVersions(serverResponse.result.groupVersions)

      console.error('wefrwefwefwefwe', JSON.stringify(serverResponse.result))

      if (needUpdateGroups.length > 0) {
        // 有需要更新的群成员
        await this.syncMemberData(needUpdateGroups)
      }

      // 更新游标（无论是否有变更都要更新）
      await dbServiceDataSync.upsert({
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
    const localVersions = await dBServiceGroupSyncStatus.getModuleVersions({ module: 'members', groupIds })
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

  // 同步群成员数据
  private async syncMemberData(groupsWithVersions: Array<{ groupId: string, version: number }>) {
    if (groupsWithVersions.length === 0) {
      return
    }

    // 直接使用传入的群组版本信息构造请求
    const response = await groupMemberSyncApi({ groups: groupsWithVersions })
    const members = response.result.groupMembers

    console.error('cxcxcxcsd11111111111111111111f', groupsWithVersions)
    console.error('cxcxcxcsd11111111111111111111f', members)

    if (members.length > 0) {
      await dBServiceGroupMember.batchCreate({ members: members })

      // 更新本地群成员版本状态
      for (const member of members) {
        await dBServiceGroupSyncStatus.upsertSyncStatus({ module: 'members', groupId: member.groupId, version: member.version })
      }

      // 发送通知到render进程，告知群成员数据已同步
      sendMainNotification('*', NotificationModule.DATABASE_GROUP, NotificationGroupCommand.GROUP_MEMBER_UPDATE, {
        updatedMembers: members.map((member: any) => ({
          groupId: member.groupId,
          userId: member.userId,
          version: member.version,
        })),
      })
    }
  }
}

// 导出群成员同步器实例
export default new GroupMemberSync()
