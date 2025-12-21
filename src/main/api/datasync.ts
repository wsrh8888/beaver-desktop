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
    url: `${getBaseUrl()}/api/datasync/getSyncAllUsers`,
  })
}

/**
 * @description: 获取所有需要更新的群组信息版本
 */
export const datasyncGetSyncGroupInfoApi = (data: IGetSyncGroupInfoReq) => {
  return ajax<IGetSyncGroupInfoRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncGroupInfo`,
  })
}

/**
 * @description: 获取所有需要更新的群成员版本
 */
export const datasyncGetSyncGroupMembersApi = (data: IGetSyncGroupMembersReq) => {
  return ajax<IGetSyncGroupMembersRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncGroupMembers`,
  })
}

/**
 * @description: 获取所有需要更新的入群申请版本
 */
export const datasyncGetSyncGroupRequestsApi = (data: IGetSyncGroupRequestsReq) => {
  return ajax<IGetSyncGroupRequestsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncGroupRequests`,
  })
}

/**
 * @description: 获取所有需要更新的聊天消息版本
 */
export const datasyncGetSyncChatMessagesApi = (data: IGetSyncChatMessagesReq) => {
  return ajax<IGetSyncChatMessagesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncChatMessages`,
  })
}

/**
 * @description: 获取所有需要更新的会话元信息版本
 */
export const datasyncGetSyncChatConversationsApi = (data: IGetSyncChatConversationsReq) => {
  return ajax<IGetSyncChatConversationsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncChatConversations`,
  })
}

/**
 * @description: 获取所有需要更新的用户会话设置版本
 */
export const datasyncGetSyncChatUserConversationsApi = (data: IGetSyncChatUserConversationsReq) => {
  return ajax<IGetSyncChatUserConversationsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncChatUserConversations`,
  })
}

/**
 * @description: 获取所有需要更新的好友版本
 */
export const datasyncGetSyncFriendsApi = (data: IGetSyncFriendsReq) => {
  return ajax<IGetSyncFriendsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncFriends`,
  })
}

/**
 * @description: 获取所有需要更新的好友验证版本
 */
export const datasyncGetSyncFriendVerifiesApi = (data: IGetSyncFriendVerifiesReq) => {
  return ajax<IGetSyncFriendVerifiesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncFriendVerifies`,
  })
}

/**
 * @description: 获取所有需要更新的表情版本
 */
export const datasyncGetSyncEmojisApi = (data: IGetSyncEmojisReq) => {
  return ajax<IGetSyncEmojisRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncEmojis`,
  })
}

/**
 * @description: 获取所有需要更新的表情收藏版本
 */
export const datasyncGetSyncEmojiCollectsApi = (data: IGetSyncEmojiCollectsReq) => {
  return ajax<IGetSyncEmojiCollectsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncEmojiCollects`,
  })
}

/**
 * @description: 获取通知事件版本摘要
 */
export const datasyncGetSyncNotificationEventsApi = (data: IGetSyncNotificationEventsReq) => {
  return ajax<IGetSyncNotificationEventsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncNotificationEvents`,
  })
}

/**
 * @description: 获取通知收件箱版本摘要
 */
export const datasyncGetSyncNotificationInboxesApi = (data: IGetSyncNotificationInboxesReq) => {
  return ajax<IGetSyncNotificationInboxesRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncNotificationInboxes`,
  })
}

/**
 * @description: 获取通知已读游标版本摘要
 */
export const datasyncGetSyncNotificationReadCursorsApi = (data: IGetSyncNotificationReadCursorsReq) => {
  return ajax<IGetSyncNotificationReadCursorsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/getSyncNotificationReadCursors`,
  })
}
