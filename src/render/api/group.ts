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
  IGroupInviteReq,
  IGroupJoinReq,
  IGroupJoinRequestHandleReq,
  IGroupJoinRequestHandleRes,
  IGroupJoinRequestListReq,
  IGroupJoinRequestListRes,
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
  ICreateBotReq,
  ICreateBotRes,
  IListBotsReq,
  IListBotsRes,
  IGetBotDetailReq,
  IGetBotDetailRes,
  IUpdateBotReq,
  IUpdateBotRes,
  IDeleteBotReq,
  IDeleteBotRes,
  IResetBotSecretReq,
  IResetBotSecretRes,
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
    url: `${baseUrl}/api/group/v1/create`,
  })
}

/**
 * @description: 删除群组
 */
export const deleteGroupApi = (data: IGroupDeleteReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/delete`,
  })
}

/**
 * @description: 移除群成员
 */
export const removeGroupMemberApi = (data: IGroupMemberRemoveReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/member_remove`,
  })
}

/**
 * @description: 添加群成员
 */
export const addGroupMemberApi = (data: IGroupMemberAddReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/member_add`,
  })
}

/**
 * @description: 获取我加入的群组列表
 */
export const getGroupListApi = (data: IGetGroupListReq) => {
  return ajax<IGroupListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/mine`,
  })
}

/**
 * @description: 更新群组信息
 */
export const updateGroupInfoApi = (data: IUpdateGroupInfoReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/update`,
  })
}

/**
 * @description: 获取群成员列表
 */
export const getGroupMembersApi = (data: IGetGroupMembersReq) => {
  return ajax<IGroupMemberListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/members`,
  })
}

/**
 * @description: 更新群成员角色
 */
export const updateMemberRoleApi = (data: IUpdateMemberRoleReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/member_role`,
  })
}

/**
 * @description: 申请加入群组
 */
export const joinGroupApi = (data: IGroupJoinReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/join`,
  })
}

/**
 * @description: 邀请用户加入群组
 */
export const inviteGroupMemberApi = (data: IGroupInviteReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/invite`,
  })
}

/**
 * @description: 退出群组
 */
export const quitGroupApi = (data: IGroupQuitReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/quit`,
  })
}

/**
 * @description: 转让群主
 */
export const transferGroupOwnerApi = (data: ITransferOwnerReq) => {
  return ajax<Record<string, never>>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/transfer`,
  })
}

/**
 * @description: 获取群的基础信息
 */
export const getGroupInfoApi = (data: IGroupInfoReq) => {
  return ajax<IGroupInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/info`,
  })
}

/**
 * @description: 搜索群聊
 */
export const searchGroupApi = (data: ISearchGroupReq) => {
  return ajax<IGroupSearchRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/group/v1/search`,
  })
}

/**
 * @description: 获取用户管理的群组申请列表
 */
export const getGroupJoinRequestListApi = (data: IGroupJoinRequestListReq) => {
  return ajax<IGroupJoinRequestListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/join_request_list`,
  })
}

/**
 * @description: 处理群组申请
 */
export const handleGroupJoinRequestApi = (data: IGroupJoinRequestHandleReq) => {
  return ajax<IGroupJoinRequestHandleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/join_request_handle`,
  })
}

/** 创建群机器人 */
export const createBotApi = (data: ICreateBotReq) => {
  return ajax<ICreateBotRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/create_bot`,
  })
}

/** 群机器人列表 */
export const listBotsApi = (data: IListBotsReq) => {
  return ajax<IListBotsRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/list_bots`,
  })
}

/** 获取群机器人详情 */
export const getBotDetailApi = (data: IGetBotDetailReq) => {
  return ajax<IGetBotDetailRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/bot_detail`,
  })
}

/** 更新群机器人 */
export const updateBotApi = (data: IUpdateBotReq) => {
  return ajax<IUpdateBotRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/update_bot`,
  })
}

/** 删除群机器人 */
export const deleteBotApi = (data: IDeleteBotReq) => {
  return ajax<IDeleteBotRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/delete_bot`,
  })
}

/** 重置群机器人密钥 */
export const resetBotSecretApi = (data: IResetBotSecretReq) => {
  return ajax<IResetBotSecretRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/group/v1/reset_bot_secret`,
  })
}
