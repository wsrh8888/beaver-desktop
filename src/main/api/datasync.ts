import type {
  IGetSyncAllUsersReq,
  IGetSyncAllUsersRes,
  IGetSyncChatConversationsReq,
  IGetSyncChatConversationsRes,
  IGetSyncChatMessagesReq,
  IGetSyncChatMessagesRes,
  IGetSyncChatUserConversationsReq,
  IGetSyncChatUserConversationsRes,
  IGetSyncEmojiCollectsReq,
  IGetSyncEmojiCollectsRes,
  IGetSyncEmojisReq,
  IGetSyncEmojisRes,
  IGetSyncFriendsReq,
  IGetSyncFriendsRes,
  IGetSyncFriendVerifiesReq,
  IGetSyncFriendVerifiesRes,
  IGetSyncGroupInfoReq,
  IGetSyncGroupInfoRes,
  IGetSyncGroupMembersReq,
  IGetSyncGroupMembersRes,
  IGetSyncGroupRequestsReq,
  IGetSyncGroupRequestsRes,
  IGetSyncNotificationEventsReq,
  IGetSyncNotificationEventsRes,
  IGetSyncNotificationInboxesReq,
  IGetSyncNotificationInboxesRes,
  IGetSyncNotificationReadCursorsReq,
  IGetSyncNotificationReadCursorsRes,
  IGetSyncDeletedMessagesReq,
  IGetSyncDeletedMessagesRes,
  IGetSyncMessageMediasReq,
  IGetSyncMessageMediasRes,
} from 'commonModule/type/ajax/datasync'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 获取所有需要更新的用户版本信息
 */
export const datasyncGetSyncAllUsersApi = (data: IGetSyncAllUsersReq) => {
  return ajax<IGetSyncAllUsersRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncAllUsers`,
  })
}

/**
 * @description: 获取所有需要更新的群组信息版本
 */
export const datasyncGetSyncGroupInfoApi = (data: IGetSyncGroupInfoReq) => {
  return ajax<IGetSyncGroupInfoRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncGroupInfo`,
  })
}

/**
 * @description: 获取所有需要更新的群成员版本
 */
export const datasyncGetSyncGroupMembersApi = (data: IGetSyncGroupMembersReq) => {
  return ajax<IGetSyncGroupMembersRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncGroupMembers`,
  })
}

/**
 * @description: 获取所有需要更新的入群申请版本
 */
export const datasyncGetSyncGroupRequestsApi = (data: IGetSyncGroupRequestsReq) => {
  return ajax<IGetSyncGroupRequestsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncGroupRequests`,
  })
}

/**
 * @description: 获取所有需要更新的聊天消息版本
 */
export const datasyncGetSyncChatMessagesApi = (data: IGetSyncChatMessagesReq) => {
  return ajax<IGetSyncChatMessagesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncChatMessages`,
  })
}

/**
 * @description: 获取所有需要更新的会话元信息版本
 */
export const datasyncGetSyncChatConversationsApi = (data: IGetSyncChatConversationsReq) => {
  return ajax<IGetSyncChatConversationsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncChatConversations`,
  })
}

/**
 * @description: 获取所有需要更新的用户会话设置版本
 */
export const datasyncGetSyncChatUserConversationsApi = (data: IGetSyncChatUserConversationsReq) => {
  return ajax<IGetSyncChatUserConversationsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncChatUserConversations`,
  })
}

/**
 * @description: 获取所有需要更新的好友版本
 */
export const datasyncGetSyncFriendsApi = (data: IGetSyncFriendsReq) => {
  return ajax<IGetSyncFriendsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncFriends`,
  })
}

/**
 * @description: 获取所有需要更新的好友验证版本
 */
export const datasyncGetSyncFriendVerifiesApi = (data: IGetSyncFriendVerifiesReq) => {
  return ajax<IGetSyncFriendVerifiesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncFriendVerifies`,
  })
}

/**
 * @description: 获取所有需要更新的表情版本
 */
export const datasyncGetSyncEmojisApi = (data: IGetSyncEmojisReq) => {
  return ajax<IGetSyncEmojisRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncEmojis`,
  })
}

/**
 * @description: 获取所有需要更新的表情收藏版本
 */
export const datasyncGetSyncEmojiCollectsApi = (data: IGetSyncEmojiCollectsReq) => {
  return ajax<IGetSyncEmojiCollectsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncEmojiCollects`,
  })
}

/**
 * @description: 获取通知事件版本摘要
 */
export const datasyncGetSyncNotificationEventsApi = (data: IGetSyncNotificationEventsReq) => {
  return ajax<IGetSyncNotificationEventsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncNotificationEvents`,
  })
}

/**
 * @description: 获取通知收件箱版本摘要
 */
export const datasyncGetSyncNotificationInboxesApi = (data: IGetSyncNotificationInboxesReq) => {
  return ajax<IGetSyncNotificationInboxesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncNotificationInboxes`,
  })
}

/**
 * @description: 获取通知已读游标版本摘要
 */
export const datasyncGetSyncNotificationReadCursorsApi = (data: IGetSyncNotificationReadCursorsReq) => {
  return ajax<IGetSyncNotificationReadCursorsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncNotificationReadCursors`,
  })
}

/**
 * @description: 获取所有需要更新的已删除消息ID列表
 */
export const datasyncGetSyncDeletedMessagesApi = (data: IGetSyncDeletedMessagesReq) => {
  return ajax<IGetSyncDeletedMessagesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncDeletedMessages`,
  })
}

/**
 * @description: 获取需要同步的消息媒体状态
 */
export const datasyncGetSyncMessageMediasApi = (data: IGetSyncMessageMediasReq) => {
  return ajax<IGetSyncMessageMediasRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncMessageMedias`,
  })
}
