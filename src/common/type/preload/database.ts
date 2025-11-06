import type { IChatConversationVerRangeReq, IChatConversationVerRangeRes, IChatHistoryReq, IChatHistoryRes, IChatMessageVerRangeReq, IChatMessageVerRangeRes, IConversationInfoReq, IConversationInfoRes, IRecentChatReq, IRecentChatRes } from '../ajax/chat'
import type { IFriendListReq, IFriendListRes, IFriendVerRangeReq, IValidListReq, IValidListRes, IValidVerRangeReq } from '../ajax/friend'
import type { IGetGroupListReq, IGetGroupMembersReq, IGroupMemberListRes } from '../ajax/group'
import type { IUserInfoRes } from '../ajax/user'

/**
 * @description: 数据库模块接口 - 按业务分类
 */
export interface IDatabaseModule {
  /**
   * @description: 用户相关
   */
  user: {
    getUserInfo(): Promise<IUserInfoRes | null>
  }

  /**
   * @description: 好友相关
   */
  friend: {
    /**
     * 获取好友列表
     */
    getFriendsList(params: IFriendListReq): Promise<IFriendListRes>
    /**
     * 获取好友验证列表
     */
    getValidList(params: IValidListReq): Promise<IValidListRes>
    /**
     * 获取好友列表 by 版本范围
     */
    getFriendsByVerRange(params: IFriendVerRangeReq): Promise<IFriendListRes>
    /**
     * 获取好友验证列表 by 版本范围
     */
    getValidByVerRange(params: IValidVerRangeReq): Promise<IValidListRes>
  }

  /**
   * @description: 聊天相关
   */
  chat: {
    /**
     * 获取最近会话列表
     */
    getRecentChatList(params: IRecentChatReq): Promise<IRecentChatRes>
    /**
     * 获取会话详细信息
     */
    getConversationInfo(params: IConversationInfoReq): Promise<IConversationInfoRes>
    /**
     * 获取聊天历史记录
     */
    getChatHistory(params: IChatHistoryReq): Promise<IChatHistoryRes>
    /**
     * 按版本范围获取聊天消息
     */
    getChatMessagesBySeqRange(params: IChatMessageVerRangeReq): Promise<IChatMessageVerRangeRes>
    /**
     * 按版本范围获取会话设置
     */
    getChatConversationsByVerRange(params: IChatConversationVerRangeReq): Promise<IChatConversationVerRangeRes>
  }
  group: {
    getGroupList(params: IGetGroupListReq): Promise<IGetGroupListReq>
    getGroupMembers(params: IGetGroupMembersReq): Promise<IGroupMemberListRes>
  }
}
