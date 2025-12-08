import type { IChatConversationVerRangeReq, IChatConversationVerRangeRes, IChatHistoryReq, IChatHistoryRes, IChatMessageVerRangeReq, IChatMessageVerRangeRes, IConversationInfoReq, IConversationInfoRes, IRecentChatReq, IRecentChatRes } from 'commonModule/type/ajax/chat'
import type { IFriendListReq, IFriendListRes, IFriendVerRangeReq, IValidListReq, IValidListRes, IValidVerRangeReq } from 'commonModule/type/ajax/friend'
import type { IGetGroupListReq, IGetGroupMembersBatchReq, IGetGroupMembersReq, IGetGroupsBatchReq, IGroupJoinRequestListReq, IGroupJoinRequestListRes, IGroupListRes, IGroupMemberListRes } from 'commonModule/type/ajax/group'
import type { IGetAllUsersRes, IUserInfoRes, IUserSyncByIdsReq, IUserSyncByIdsRes } from 'commonModule/type/ajax/user'
import type { IDatabaseModule } from 'commonModule/type/preload/database'
import { DatabaseCommand } from 'commonModule/type/ipc/command'
import { DataChatCommand, DataFriendCommand, DataGroupCommand, DataUserCommand } from 'commonModule/type/ipc/database'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const databaseModule: IDatabaseModule = {
  // 用户相关
  user: {
    getUserInfo: async (): Promise<IUserInfoRes | null> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.USER, {
        command: DataUserCommand.GET_USER_INFO,
      })
    },
    getUsersBasicInfo: async (params: IUserSyncByIdsReq): Promise<IUserSyncByIdsRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.USER, {
        command: DataUserCommand.GET_USERS_BASIC_INFO,
        data: params,
      })
    },
    getAllUsers: async (): Promise<IGetAllUsersRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.USER, {
        command: DataUserCommand.GET_ALL_USERS,
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
    getFriendsByUuid: async (params: { friendIds: string[] }): Promise<IFriendListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_FRIENDS_BY_UUID,
        data: params,
      })
    },
    getValidByUuid: async (params: { verifyIds: string[] }): Promise<IValidListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.FRIEND, {
        command: DataFriendCommand.GET_VALID_BY_UUID,
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
    getGroupList: async (params: IGetGroupListReq): Promise<IGroupListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_LIST,
        data: params,
      })
    },
    getGroupsBatch: async (params: IGetGroupsBatchReq): Promise<IGroupListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUPS_BATCH,
        data: params,
      })
    },
    getGroupMembers: async (params: IGetGroupMembersReq): Promise<IGroupMemberListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_MEMBERS,
        data: params,
      })
    },
    getGroupMembersBatch: async (params: IGetGroupMembersBatchReq): Promise<IGroupMemberListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_MEMBERS_BATCH,
        data: params,
      })
    },
    getGroupJoinRequestList: async (params: IGroupJoinRequestListReq): Promise<IGroupJoinRequestListRes> => {
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_JOIN_REQUEST_LIST,
        data: params,
      })
    },
    getAllGroupJoinRequests: async (params: IGroupJoinRequestListReq): Promise<IGroupJoinRequestListRes> => {
      // 合并为同一个方法：获取用户相关的群组申请（包括用户申请的 + 别人申请用户管理的群组）
      return await ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, DatabaseCommand.GROUP, {
        command: DataGroupCommand.GET_GROUP_JOIN_REQUEST_LIST,
        data: params,
      })
    },
  },
}
