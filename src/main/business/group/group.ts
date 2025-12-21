import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetGroupListReq, IGetGroupMembersBatchReq, IGetGroupMembersReq, IGetGroupsBatchReq, IGroupJoinRequestListReq, IGroupJoinRequestListRes, IGroupListRes, IGroupMemberListRes } from 'commonModule/type/ajax/group'
import type { QueueItem } from '../base/base'
import { NotificationGroupCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { groupSyncApi } from 'mainModule/api/group'
import dbServiceGroup  from 'mainModule/database/services/group/group'
import dBServiceGroupJoinRequest  from 'mainModule/database/services/group/group-join-request'
import dBServiceGroupMember  from 'mainModule/database/services/group/group-member'
import dBServiceUser  from 'mainModule/database/services/user/user'

import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 群组同步队列项
 */
interface GroupSyncItem extends QueueItem {
  userId: string
  groupId?: string
  version: number
}

/**
 * 群组业务逻辑
 * 对应 groups 表
 * 负责群组管理的业务逻辑
 */
class GroupBusiness extends BaseBusiness<GroupSyncItem> {
  protected readonly businessName = 'GroupBusiness'

  constructor() {
    super({
      queueSizeLimit: 25, // 群组同步请求适中
      delayMs: 1000,
    })
  }

  /**
   * 获取用户加入的群组列表
   */
  async getGroupList(header: ICommonHeader, _params: IGetGroupListReq): Promise<IGroupListRes> {
    const { userId } = header

    // 调用服务层获取用户加入的群组成员记录（纯数据库查询）
    const userMemberships = await dBServiceGroupMember.getUserMemberships({ userId })

    if (userMemberships.length === 0) {
      return { list: [], count: 0 }
    }

    // 业务逻辑：提取群组ID列表
    const groupIds = userMemberships.map((membership) => membership.groupId)

    // 业务逻辑：获取这些群组的详细信息
    const groupDetails = await dbServiceGroup.getGroupsByIds(groupIds)

    // 业务逻辑：组装返回数据
    const list = groupDetails.map((group: any) => {
      return {
        groupId: group.groupId,
        title: group.title || '',
        avatar: group.avatar || '',
        conversationId: `group_${group.groupId}`, // conversationId格式：group_${groupId}
        version: group.version || 0,
      }
    })

    return {
      list,
      count: list.length,
    }
  }

  /**
   * 批量获取多个群组的详细信息
   */
  async getGroupsBatch(_header: ICommonHeader, params: IGetGroupsBatchReq): Promise<IGroupListRes> {
    const { groupIds } = params

    // 调用服务层批量获取群组信息
    const groups = await dbServiceGroup.getGroupsByIds(groupIds)

    // 业务逻辑：获取每个群组的成员数量
    const memberCounts = new Map<string, number>()
    for (const groupId of groupIds) {
      const members = await dBServiceGroupMember.getGroupMembers({ groupId })
      memberCounts.set(groupId, members.length)
    }

    // 业务逻辑：组装返回数据
    const list = groups.map((group: any) => {
      return {
        groupId: group.groupId,
        title: group.title || '',
        avatar: group.avatar || '',
        conversationId: `group_${group.groupId}`, // conversationId格式：group_${groupId}
        version: group.version || 0,
      }
    })

    return {
      list,
      count: list.length,
    }
  }

  /**
   * 获取群组成员列表
   */
  async getGroupMembers(_header: ICommonHeader, params: IGetGroupMembersReq): Promise<IGroupMemberListRes> {
    const { groupId } = params

    // 调用服务层获取群组成员（纯数据库查询）
    const members = await dBServiceGroupMember.getGroupMembers({ groupId })

    // 业务逻辑：获取成员的用户信息
    const userIds = members.map((m: any) => m.userId).filter((id: string) => id)
    const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds })
    const userInfoMap = new Map(userInfos.map(u => [u.userId, u]))

    // 业务逻辑：格式化数据
    const list = members.map((member: any) => {
      const userInfo = userInfoMap.get(member.userId)
      return {
        userId: member.userId,
        nickName: userInfo?.nickName || '',
        avatar: userInfo?.avatar || '',
        role: member.role || 0,
        status: member.status || 1,
        joinTime: member.joinTime ? new Date(member.joinTime * 1000).toISOString() : '',
        version: member.version || 0,
      }
    })

    return {
      list,
      count: list.length,
    }
  }

  /**
   * 批量获取多个群组的成员列表
   */
  async getGroupMembersBatch(_header: ICommonHeader, params: IGetGroupMembersBatchReq): Promise<IGroupMemberListRes> {
    const { groupIds } = params

    // 调用服务层批量获取群组成员（纯数据库查询）
    const allMembers = []
    for (const groupId of groupIds) {
      const members = await dBServiceGroupMember.getGroupMembers({ groupId })
      allMembers.push(...members)
    }

    // 业务逻辑：获取所有成员的用户信息
    const userIds = allMembers.map((m: any) => m.userId).filter((id: string) => id)
    const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds })
    const userInfoMap = new Map(userInfos.map(u => [u.userId, u]))

    // 业务逻辑：格式化数据
    const list = allMembers.map((member: any) => {
      const userInfo = userInfoMap.get(member.userId)
      return {
        userId: member.userId,
        groupId: member.groupId,
        nickName: userInfo?.nickName || '',
        avatar: userInfo?.avatar || '',
        role: member.role || 0,
        status: member.status || 1,
        joinTime: member.joinTime ? new Date(member.joinTime * 1000).toISOString() : '',
        version: member.version || 0,
      }
    })

    return {
      list,
      count: list.length,
    }
  }

  /**
   * 获取用户相关的群组申请列表
   * 包括：1. 用户申请的群组（我申请别人的群）
   *       2. 别人申请用户管理的群组（别人申请我管理的群）
   */
  async getGroupJoinRequests(header: ICommonHeader, params: IGroupJoinRequestListReq): Promise<IGroupJoinRequestListRes> {
    const { userId } = header
    const { page = 1, limit = 20 } = params

    // 调用服务层获取用户管理的群组（纯数据库查询）
    const userMemberships = await dBServiceGroupMember.getUserMemberships({ userId })
    const managedGroups = userMemberships.filter((m: any) => m.role === 1 || m.role === 2) // 1群主 2管理员
    const managedGroupIds = managedGroups.map((g: any) => g.groupId)

    // 业务逻辑：获取用户相关的所有群组申请记录
    // 包括：1. 用户申请的群组 2. 别人申请用户管理的群组
    const userRequests = await dBServiceGroupJoinRequest.getJoinRequestsByApplicantId({
      applicantUserId: userId,
      options: { page: 1, limit: Math.ceil(limit / 2) } // 分页分配
    })

    const managedRequests = managedGroupIds.length > 0 ? await dBServiceGroupJoinRequest.getJoinRequestsByGroupIdsSimple({
      groupIds: managedGroupIds,
      options: { page: 1, limit: Math.ceil(limit / 2) } // 分页分配
    }) : []

    // 合并并排序
    const allRequests = [...userRequests, ...managedRequests]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit)

    // 计算总数
    const userCount = await dBServiceGroupJoinRequest.getJoinRequestsCountByApplicantId({ applicantUserId: userId })
    const managedCount = managedGroupIds.length > 0 ? await dBServiceGroupJoinRequest.getJoinRequestsCountByGroupIds({ groupIds: managedGroupIds }) : 0
    const total = userCount + managedCount

    const requests = allRequests

    // 业务逻辑：获取所有申请者ID
    const applicantIds = requests.map((r: any) => r.applicantUserId).filter((id: string) => id)

    // 业务逻辑：批量获取申请者用户信息
    const userInfos = await dBServiceUser.getUsersBasicInfo({ userIds: applicantIds })
    const userInfoMap = new Map(userInfos.map(u => [u.userId, u]))

    // 业务逻辑：转换为API响应格式
    const list = requests.map((request: any) => {
      const userInfo = userInfoMap.get(request.applicantUserId)

      return {
        requestId: request.id as number,
        groupId: request.groupId as string,
        applicantId: request.applicantUserId as string,
        applicantName: userInfo?.nickName || '',
        applicantAvatar: userInfo?.avatar || '',
        message: request.message || '',
        status: request.status || 0,
        createdAt: request.createdAt || 0,
        version: request.version || 0,
      }
    })

    return { list, count: total }
  }

  /**
   * 处理群组表的更新通知
   * 将同步请求加入队列，1秒后批量处理
   */
  async handleTableUpdates(userId: string, version: number, groupId?: string) {
    this.addToQueue({
      key: userId,
      data: { userId, groupId, version },
      timestamp: Date.now(),
      userId,
      groupId,
      version,
    })
  }

  /**
   * 批量处理群组同步请求
   */
  protected async processBatchRequests(items: GroupSyncItem[]): Promise<void> {
    // 构造同步请求参数
    const groupsToSync = items.map(item => ({
      groupId: item.groupId || '', // 如果没有groupId，可能需要特殊处理
      version: item.version,
    })).filter(item => item.groupId) // 只同步有groupId的项

    if (groupsToSync.length === 0) {
      console.log('群组同步完成: noValidGroupIds=true')
      return
    }

    try {
      const response = await groupSyncApi({
        groups: groupsToSync,
      })

      if (response.result?.groups && response.result.groups.length > 0) {
        // 更新本地数据库，转换数据类型
        for (const group of response.result.groups) {
          const groupData = {
            groupId: group.groupId,
            title: group.title,
            avatar: group.avatar || '', // 使用 fileName 作为头像
            creatorId: group.creatorId,
            notice: '', // 同步API中没有notice字段
            joinType: group.joinType || 0,
            status: group.status || 1, // 直接使用服务器返回的状态：1正常 2冻结 3解散
            version: group.version || 0,
            createdAt: Math.floor(group.createdAt / 1000), // 转换为秒级时间戳
            updatedAt: Math.floor(group.updatedAt / 1000),
          }
          await dbServiceGroup.upsert(groupData)
        }

        console.log(`群组数据同步成功: count=${response.result.groups.length}`)

        // 发送通知到render进程，告知群组数据已更新
        sendMainNotification('*', NotificationModule.DATABASE_GROUP, NotificationGroupCommand.GROUP_UPDATE, {
          updatedGroups: response.result.groups.map((group: any) => ({
            groupId: group.groupId,
            version: group.version,
          })),
        })
      }
      else {
        console.log('群组数据同步完成: noUpdates=true')
      }
    }
    catch (error) {
      console.error('同步群组数据失败:', error)
    }
  }
}

// 导出单例实例
export default new GroupBusiness()
