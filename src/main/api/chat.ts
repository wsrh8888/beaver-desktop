import type {
  IChatSyncReq,
  IChatSyncRes,
  IConversationSyncReq,
  IConversationSyncRes,
  IGetConversationsListByIdsReq,
  IGetConversationsListByIdsRes,
  IGetUserConversationSettingsListByIdsReq,
  IGetUserConversationSettingsListByIdsRes,
  IUserConversationSyncReq,
  IUserConversationSyncRes,
} from 'commonModule/type/ajax/chat'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 聊天数据同步
 */
export const chatSyncApi = (data: IChatSyncReq) => {
  return ajax<IChatSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/sync`,
  })
}

/**
 * @description: 会话数据同步
 */
export const conversationSyncApi = (data: IConversationSyncReq) => {
  return ajax<IConversationSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/conversationSync`,
  })
}

/**
 * @description: 用户会话关系数据同步
 */
export const userConversationSyncApi = (data: IUserConversationSyncReq) => {
  return ajax<IUserConversationSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/userConversationSync`,
  })
}

/**
 * @description: 批量获取会话数据
 */
export const getConversationsListByIdsApi = (data: IGetConversationsListByIdsReq) => {
  return ajax<IGetConversationsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/getConversationsListByIds`,
  })
}

/**
 * @description: 批量获取用户会话设置数据
 */
export const getUserConversationSettingsListByIdsApi = (data: IGetUserConversationSettingsListByIdsReq) => {
  return ajax<IGetUserConversationSettingsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/getUserConversationSettingsListByIds`,
  })
}
