import { baseUrl } from "commonModule/config"
import { IGroupAnnouncementReq, IGroupCreateReq, IGroupCreateRes, IGroupDeleteReq, IGroupFileDeleteReq, IGroupFileListReq, IGroupFileListRes, IGroupFileUploadReq, IGroupFileUploadRes, IGroupInfoReq, IGroupInfoRes, IGroupInviteReq, IGroupJoinReq, IGroupListRes, IGroupMemberAddReq, IGroupMemberListRes, IGroupMemberRemoveReq, IGroupMuteListReq, IGroupMuteListRes, IGroupMuteReq, IGroupQuitReq, IGroupSettingsReq, ITransferOwnerReq, IUpdateDisplayNameReq, IUpdateGroupInfoReq, IUpdateMemberRoleReq } from "commonModule/type/ajax/group"
import { ajax } from "commonModule/utils/axios/request"


/**
 * @description: 创建群组
 */
export const createGroupApi = (data: IGroupCreateReq) => {
  return ajax<IGroupCreateRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/create`
  })
}

/**
 * @description: 删除群组
 */
export const deleteGroupApi = (data: IGroupDeleteReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/delete/${data.groupId}`
  })
}

/**
 * @description: 移除群成员
 */
export const removeGroupMemberApi = (data: IGroupMemberRemoveReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/memberRemove`
  })
}

/**
 * @description: 添加群成员
 */
export const addGroupMemberApi = (data: IGroupMemberAddReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/memberAdd`
  })
}

/**
 * @description: 获取群组列表
 */
export const getGroupListApi = (data) => {
  return ajax<IGroupListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/group_mine`
  })
}

/**
 * @description: 更新群组信息
 */
export const updateGroupInfoApi = (data: IUpdateGroupInfoReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/update`
  })
}

/**
 * @description: 获取群成员列表
 */
export const getGroupMembersApi = (data: { groupId: string; page?: number; limit?: number }) => {
  return ajax<IGroupMemberListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/members`
  })
}

/**
 * @description: 更新群成员角色
 */
export const updateMemberRoleApi = (data: IUpdateMemberRoleReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/member/role`
  })
}

/**
 * @description: 更新群公告
 */
export const updateGroupAnnouncementApi = (data: IGroupAnnouncementReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/announcement`
  })
}

/**
 * @description: 邀请成员
 */
export const inviteGroupMembersApi = (data: IGroupInviteReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/invite`
  })
}

/**
 * @description: 申请加入群组
 */
export const joinGroupApi = (data: IGroupJoinReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/join`
  })
}

/**
 * @description: 更新群组设置
 */
export const updateGroupSettingsApi = (data: IGroupSettingsReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/settings`
  })
}

/**
 * @description: 群成员禁言管理
 */
export const groupMuteApi = (data: IGroupMuteReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/mute`
  })
}

/**
 * @description: 上传群文件
 */
export const uploadGroupFileApi = (data: IGroupFileUploadReq) => {
  return ajax<IGroupFileUploadRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/file/upload`
  })
}

/**
 * @description: 获取群文件列表
 */
export const getGroupFileListApi = (data: IGroupFileListReq) => {
  return ajax<IGroupFileListRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/group/file/list`
  })
}

/**
 * @description: 删除群文件
 */
export const deleteGroupFileApi = (data: IGroupFileDeleteReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/file/delete`
  })
}

/**
 * @description: 退出群组
 */
export const quitGroupApi = (data: IGroupQuitReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/quit`
  })
}

/**
 * @description: 转让群主
 */
export const transferGroupOwnerApi = (data: ITransferOwnerReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/transfer`
  })
}

/**
 * @description: 获取禁言成员列表
 */
export const getGroupMuteListApi = (data: IGroupMuteListReq) => {
  return ajax<IGroupMuteListRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/group/mute/list`
  })
}

/**
 * @description: 更新群内显示名称
 */
export const updateDisplayNameApi = (data: IUpdateDisplayNameReq) => {
  return ajax<{}>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/member/displayName`
  })
}

/**
 * @description: 获取群的基础信息
 */
export const getGroupInfoApi = (data: IGroupInfoReq) => {
  return ajax<IGroupInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/groupInfo`
  })
}

