import type {
  IGetGroupListReq,
  IGetGroupMembersReq,
  IGroupAnnouncementReq,
  IGroupAnnouncementRes,
  IGroupCreateReq,
  IGroupCreateRes,
  IGroupDeleteReq,
  IGroupInfoReq,
  IGroupInfoRes,
  IGroupJoinReq,
  IGroupListRes,
  IGroupMemberAddReq,
  IGroupMemberListRes,
  IGroupMemberRemoveReq,
  IGroupQuitReq,
  IGroupSearchRes,
  ISearchGroupReq,
  ITransferOwnerReq,
  IUpdateGroupInfoReq,
  IUpdateMemberRoleReq,
} from 'commonModule/type/ajax/group'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 创建群组
 */
export const createGroupApi = (data: IGroupCreateReq) => {
  return ajax<IGroupCreateRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/create`,
  })
}

/**
 * @description: 删除群组
 */
export const deleteGroupApi = (data: IGroupDeleteReq) => {
  return ajax<Record<string, never>>({
    method: 'DELETE',
    data,
    url: `${baseUrl}/api/group/delete/${data.groupId}`,
  })
}

/**
 * @description: 移除群成员
 */
export const removeGroupMemberApi = (data: IGroupMemberRemoveReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/memberRemove`,
  })
}

/**
 * @description: 添加群成员
 */
export const addGroupMemberApi = (data: IGroupMemberAddReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/memberAdd`,
  })
}

/**
 * @description: 获取群组列表
 */
export const getGroupListApi = (data: IGetGroupListReq) => {
  return ajax<IGroupListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/group_mine`,
  })
}

/**
 * @description: 更新群组信息
 */
export const updateGroupInfoApi = (data: IUpdateGroupInfoReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/update`,
  })
}

/**
 * @description: 获取群成员列表
 */
export const getGroupMembersApi = (data: IGetGroupMembersReq) => {
  return ajax<IGroupMemberListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/members`,
  })
}

/**
 * @description: 更新群成员角色
 */
export const updateMemberRoleApi = (data: IUpdateMemberRoleReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/member/role`,
  })
}

/**
 * @description: 更新群公告
 */
export const updateGroupAnnouncementApi = (data: IGroupAnnouncementReq) => {
  return ajax<IGroupAnnouncementRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/announcement`,
  })
}

/**
 * @description: 申请加入群组
 */
export const joinGroupApi = (data: IGroupJoinReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/join`,
  })
}

/**
 * @description: 退出群组
 */
export const quitGroupApi = (data: IGroupQuitReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/quit`,
  })
}

/**
 * @description: 转让群主
 */
export const transferGroupOwnerApi = (data: ITransferOwnerReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/transfer`,
  })
}

/**
 * @description: 获取群的基础信息
 */
export const getGroupInfoApi = (data: IGroupInfoReq) => {
  return ajax<IGroupInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/groupInfo`,
  })
}

/**
 * @description: 搜索群聊
 */
export const searchGroupApi = (data: ISearchGroupReq) => {
  return ajax<IGroupSearchRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/group/search`,
  })
}
