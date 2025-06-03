import { baseUrl } from "commonModule/config"
import { IRecentChatRes, IConversationInfoRes, IChatHistoryRes } from "commonModule/type/ajax/chat"
import { ajax } from "commonModule/utils/axios/request"
/**
 * @description: 获取最新的聊天列表
 */
export const getRecentChatListApi = () => {
  return ajax<IRecentChatRes>({
    method: 'GET',
    url: `${baseUrl}/api/chat/getRecentChatList`
  })
}
/**
 * @description: 创建会话
 */
export const getcreateConversationApi = (data:object) => {
  return ajax<IRecentChatRes>({
    method: 'POST',
    data:data,
    url: `${baseUrl}/api/chat/createConversation`
  })
}

/**
 * @description: 通过会话id获取最新的会话信息
 */
export const getRecentChatInfoApi = (data) => {
  return ajax<IConversationInfoRes>({
    method: 'POST',
    data: data,
    url: `${baseUrl}/api/chat/getConversationInfo`
  })
}
/**
 * @description: 获取与好友聊天记录
 */
export const getChatHistoryApi = (data) => {
  return ajax<IChatHistoryRes>({
    method: 'POST',
    data:data,
    url: `${baseUrl}/api/chat/getChatHistory`
  })
}
/**
 * @description: 上传文件到七牛云  file
 */
export const getuploadQiniuApi = (filePath:string) => {
  return new Promise((resolve, reject) => {
    
  });
};

