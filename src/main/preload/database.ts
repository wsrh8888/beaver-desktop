import type { IFriendListReq, IFriendListRes, IFriendVerRangeReq, IValidListReq, IValidListRes, IValidVerRangeReq } from 'commonModule/type/ajax/friend'
import type { IUserInfoRes } from 'commonModule/type/ajax/user'
import type { IConversationInfoReq, IConversationInfoRes, IChatHistoryReq, IChatHistoryRes, IRecentChatRes, IChatMessageVerRangeReq, IChatMessageVerRangeRes, IChatConversationVerRangeReq, IChatConversationVerRangeRes, IRecentChatReq } from 'commonModule/type/ajax/chat'
import type { IDatabaseModule } from 'commonModule/type/preload/database'
import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { DataFriendCommand, DataUserCommand, DataChatCommand, DataGroupCommand } from 'commonModule/type/ipc/database'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'mainModule/utils/preload/ipcRender'
import { IGetGroupListReq, IGetGroupMembersReq, IGroupMemberListRes } from 'commonModule/type/ajax/group'

export const databaseModule: IDatabaseModule = {
  // 用户相关
  user: {
    getUserInfo: async (): Promise<IUserInfoRes | null> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.USER, {
        command: DataUserCommand.GET_USER_INFO,
      })
    },
  },
  friend: {
    getFriendsList: async (params?: IFriendListReq): Promise<IFriendListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_FRIENDS,
        data: params,
      })
    },
    getValidList: async (params?: IValidListReq): Promise<IValidListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_VALID_LIST,
        data: params,
      })
    },
    getFriendsByVerRange: async (params: IFriendVerRangeReq): Promise<IFriendListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_FRIENDS_BY_VER_RANGE,
        data: params,
      })
    },
    getValidByVerRange: async (params: IValidVerRangeReq): Promise<IValidListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_VALID_BY_VER_RANGE,
        data: params,
      })
    },
  },
  chat: {
    getRecentChatList: async (params: IRecentChatReq): Promise<IRecentChatRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.CHAT, {
        command: DataChatCommand.GET_RECENT_CHAT_LIST,
        data: params,
      })
    },
    getConversationInfo: async (params: IConversationInfoReq): Promise<IConversationInfoRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.CHAT, {
        command: DataChatCommand.GET_CONVERSATION_INFO,
        data: params,
      })
    },
    getChatHistory: async (params: IChatHistoryReq): Promise<IChatHistoryRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.CHAT, {
        command: DataChatCommand.GET_CHAT_HISTORY,
        data: params,
      })
    },
    getChatMessagesBySeqRange: async (params: IChatMessageVerRangeReq): Promise<IChatMessageVerRangeRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.CHAT, {
        command: DataChatCommand.GET_CHAT_MESSAGES_BY_SEQ_RANGE,
        data: params,
      })
    },
    getChatConversationsByVerRange: async (params: IChatConversationVerRangeReq): Promise<IChatConversationVerRangeRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.CHAT, {
        command: DataChatCommand.GET_CHAT_CONVERSATIONS_BY_VER_RANGE,
        data: params,
      })
    },
  },
  group: {
    getGroupList: async (params: IGetGroupListReq): Promise<IGetGroupListReq> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_LIST,
        data: params,
      })
    },
    getGroupMembers: async (params: IGetGroupMembersReq): Promise<IGroupMemberListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_MEMBERS,
        data: params,
      })
    },
  },
}
