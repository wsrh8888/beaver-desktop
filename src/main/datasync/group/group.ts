import { datasyncGetSyncGroupInfoApi } from 'mainModule/api/datasync'
import { groupSyncApi } from 'mainModule/api/group'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { GroupService } from 'mainModule/database/services/group/group'
import { GroupSyncStatusService } from 'mainModule/database/services/group/group-sync-status'
import logger from 'mainModule/utils/log'

// 群资料同步器（对应服务器group表）
class GroupSync {
  // 检查并同步群资料
  async checkAndSync() {
    logger.info({ text: '开始同步群资料数据' })
    try {
      // 获取本地最后同步时间
      const lastSyncTime = await DataSyncService.get('groups').then(cursor => cursor?.version || 0).catch(() => 0)

      // 获取服务器上变更的群组版本信息
      const serverResponse = await datasyncGetSyncGroupInfoApi({ since: lastSyncTime })

      // 对比本地数据，过滤出需要更新的群组
      const needUpdateGroups = await this.compareAndFilterGroupVersions(serverResponse.result.groupVersions)

      if (needUpdateGroups.length > 0) {
        // 有需要更新的群资料
        await this.syncGroupData(needUpdateGroups)
      }

      // 更新游标（无论是否有变更都要更新）
      await DataSyncService.upsert({
        module: 'groups',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => { })
    }
    catch (error) {
      logger.error({ text: '群资料同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要更新的群组信息
  private async compareAndFilterGroupVersions(groupVersions: any[]): Promise<Array<{ groupId: string, version: number }>> {
    if (groupVersions.length === 0) {
      return []
    }

    // 提取所有变更的群组ID
    const groupIds = groupVersions.map(item => item.groupId)

    // 查询本地已存在的群组资料版本状态
    const localVersions = await GroupSyncStatusService.getModuleVersions('info', groupIds)
    const localVersionMap = new Map(localVersions.map(v => [v.groupId, v.version]))

    // 过滤出需要更新的群组（本地不存在或版本号更旧的数据）
    const needUpdateGroups = groupVersions.filter((groupVersion) => {
      const localVersion = localVersionMap.get(groupVersion.groupId) || 0
      // 如果服务器版本更新，则需要更新
      return localVersion < groupVersion.version
    })

    return needUpdateGroups
  }

  // 同步群资料数据
  private async syncGroupData(groupsWithVersions: Array<{ groupId: string, version: number }>) {
    if (groupsWithVersions.length === 0) {
      return
    }

    // 直接使用传入的群组版本信息构造请求
    const response = await groupSyncApi({ groups: groupsWithVersions })
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

      // 更新本地群组版本状态
      for (const group of localGroups) {
        await GroupSyncStatusService.upsertSyncStatus('info', group.groupId, group.version)
      }
    }
  }
}

// 导出群资料同步器实例
export default new GroupSync()
