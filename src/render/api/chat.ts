import type {
  IChatHistoryReq,
  IChatHistoryRes,
  IConversationInfoReq,
  IConversationInfoRes,
  ICreateConversationReq,
  IDeleteMessagesReq,
  IDeleteMessagesRes,
  IDeleteRecentReq,
  IDeleteRecentRes,
  IForwardMessageReq,
  IForwardMessageRes,
  IHideChatReq,
  IHideChatRes,
  IMuteChatReq,
  IMuteChatRes,
  IPinnedChatReq,
  IPinnedChatRes,
  IRecallMessageReq,
  IRecallMessageRes,
  IRecentChatListReq,
  IRecentChatRes,
  ISendMsgReq,
  ISendMsgRes,
  IUpdateReadSeqReq,
  IUpdateReadSeqRes,
  IGetForwardDetailsReq,
  IGetForwardDetailsRes,
  IMarkMessageMediaReq,
  IMarkMessageMediaRes,
} from 'commonModule/type/ajax/chat'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'
/**
 * @description: 获取最新的聊天列表
 */
export const getRecentChatListApi = (params: IRecentChatListReq) => {
  return ajax<IRecentChatRes>({
    method: 'GET',
    url: `${baseUrl}/api/chat/v1/getRecentChatList`,
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
    url: `${baseUrl}/api/chat/v1/createConversation`,
  })
}

/**
 * @description: 通过会话id获取最新的会话信息
 */
export const getRecentChatInfoApi = (data: IConversationInfoReq) => {
  return ajax<IConversationInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/getConversationInfo`,
  })
}
/**
 * @description: 获取与好友聊天记录
 */
export const getChatHistoryApi = (data: IChatHistoryReq) => {
  return ajax<IChatHistoryRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/getChatHistory`,
  })
}

/**
 * @description: 发送消息
 */
export const sendMsgApi = (data: ISendMsgReq) => {
  return ajax<ISendMsgRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/sendMsg`,
  })
}

/**
 * @description: 删除最近会话
 */
export const deleteRecentApi = (data: IDeleteRecentReq) => {
  return ajax<IDeleteRecentRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/deleteRecentChat`,
  })
}

/**
 * @description: 置顶会话
 */
export const pinnedChatApi = (data: IPinnedChatReq) => {
  return ajax<IPinnedChatRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/pinnedChat`,
  })
}

/**
 * @description: 撤回消息
 */
export const recallMessageApi = (data: IRecallMessageReq) => {
  return ajax<IRecallMessageRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/recall`,
  })
}

/**
 * @description: 转发消息
 */
export const forwardMessageApi = (data: IForwardMessageReq) => {
  return ajax<IForwardMessageRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/forward`,
  })
}

/**
 * @description: 获取合并转发详情
 */
export const getForwardDetailsApi = (params: IGetForwardDetailsReq) => {
  return ajax<IGetForwardDetailsRes>({
    method: 'GET',
    url: `${baseUrl}/api/chat/v1/getForwardDetails`,
    params,
  })
}

/**
 * @description: 批量删除消息（仅对自己生效，对方仍可见）
 */
export const deleteMessagesApi = (data: IDeleteMessagesReq) => {
  return ajax<IDeleteMessagesRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/deleteMessages`,
  })
}

/**
 * @description: 删除单条消息（仅对自己生效，对方仍可见）
 */
export const deleteMessageApi = (data: { messageId: string }) => {
  return deleteMessagesApi({ messageIds: [data.messageId] })
}


/**
 * @description: 更新会话已读序列号
 */
export const updateReadSeqApi = (data: IUpdateReadSeqReq) => {
  return ajax<IUpdateReadSeqRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/updateReadSeq`,
  })
}

/**
 * @description: 设置会话免打扰
 */
export const muteChatApi = (data: IMuteChatReq) => {
  return ajax<IMuteChatRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/muteChat`,
  })
}

/**
 * @description: 隐藏/显示会话
 */
export const hideChatApi = (data: IHideChatReq) => {
  return ajax<IHideChatRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/hideChat`,
  })
}

/**
 * @description: 标记消息媒体状态（如语音已播放）
 */
export const markMessageMediaApi = (data: IMarkMessageMediaReq) => {
  return ajax<IMarkMessageMediaRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/chat/v1/markMessageMedia`,
  })
}
