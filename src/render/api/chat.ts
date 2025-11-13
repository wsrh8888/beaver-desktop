import type {
  IChatHistoryReq,
  IChatHistoryRes,
  IConversationInfoReq,
  IConversationInfoRes,
  ICreateConversationReq,
  IDeleteRecentReq,
  IDeleteRecentRes,
  IEditMessageReq,
  IEditMessageRes,
  IForwardMessageReq,
  IForwardMessageRes,
  IPinnedChatReq,
  IPinnedChatRes,
  IRecallMessageReq,
  IRecallMessageRes,
  IRecentChatListReq,
  IRecentChatRes,
  ISendMsgReq,
  ISendMsgRes,
} from 'commonModule/type/ajax/chat'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'
/**
 * @description: 获取最新的聊天列表
 */
export const getRecentChatListApi = (params: IRecentChatListReq) => {
  return ajax<IRecentChatRes>({
    method: 'GET',
    url: `${baseUrl}/api/chat/getRecentChatList`,
    params, // GET请求使用params传递查询参数
  })
}
/**
 * @description: 创建会话
 */
export const getcreateConversationApi = (data: ICreateConversationReq) => {
  return ajax<IRecentChatRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/createConversation`,
  })
}

/**
 * @description: 通过会话id获取最新的会话信息
 */
export const getRecentChatInfoApi = (data: IConversationInfoReq) => {
  return ajax<IConversationInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/getConversationInfo`,
  })
}
/**
 * @description: 获取与好友聊天记录
 */
export const getChatHistoryApi = (data: IChatHistoryReq) => {
  return ajax<IChatHistoryRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/getChatHistory`,
  })
}

/**
 * @description: 发送消息
 */
export const sendMsgApi = (data: ISendMsgReq) => {
  return ajax<ISendMsgRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/sendMsg`,
  })
}

/**
 * @description: 删除最近会话
 */
export const deleteRecentApi = (data: IDeleteRecentReq) => {
  return ajax<IDeleteRecentRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/deleteRecentChat`,
  })
}

/**
 * @description: 置顶会话
 */
export const pinnedChatApi = (data: IPinnedChatReq) => {
  return ajax<IPinnedChatRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/pinnedChat`,
  })
}

/**
 * @description: 编辑消息
 */
export const editMessageApi = (data: IEditMessageReq) => {
  return ajax<IEditMessageRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/edit`,
  })
}

/**
 * @description: 撤回消息
 */
export const recallMessageApi = (data: IRecallMessageReq) => {
  return ajax<IRecallMessageRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/recall`,
  })
}

/**
 * @description: 转发消息
 */
export const forwardMessageApi = (data: IForwardMessageReq) => {
  return ajax<IForwardMessageRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/forward`,
  })
}
