import type {
  IChatSyncReq,
  IChatSyncRes,
  IGetConversationsListByIdsReq,
  IGetConversationsListByIdsRes,
  IGetUserConversationSettingsListByIdsReq,
  IGetUserConversationSettingsListByIdsRes,
} from 'commonModule/type/ajax/chat'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 某个会话的聊天数据同步
 */
export const chatSyncApi = (data: IChatSyncReq) => {
  return ajax<IChatSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/sync`,
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
