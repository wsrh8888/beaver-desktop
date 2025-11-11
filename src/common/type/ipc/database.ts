export enum DataUserCommand {

  GET_USER_INFO = 'user:getUserInfo',
}

export enum DataFriendCommand {
  GET_FRIENDS = 'friend:getFriends',
  GET_VALID_LIST = 'friend:getValidList',
  GET_FRIENDS_BY_VER_RANGE = 'friend:getFriendsByVerRange',
  GET_VALID_BY_VER_RANGE = 'friend:getValidByVerRange',
}

export enum DataGroupCommand {
  GET_GROUP_LIST = 'group:getGroupList',
  GET_GROUP_MEMBERS = 'group:getGroupMembers',
  /**
   * @description: 获取用户管理的群组申请列表
   */
  GET_GROUP_JOIN_REQUEST_LIST = 'group:getGroupJoinRequestList',
  /**
   * @description: 获取所有群组申请列表
   */
  GET_ALL_GROUP_JOIN_REQUESTS = 'group:getAllGroupJoinRequests',
}

export enum DataChatCommand {
  GET_RECENT_CHAT_LIST = 'chat:getRecentChatList',
  GET_CONVERSATION_INFO = 'chat:getConversationInfo',
  GET_CHAT_HISTORY = 'chat:getChatHistory',
  GET_CHAT_MESSAGES_BY_SEQ_RANGE = 'chat:getChatMessagesBySeqRange',
  GET_CHAT_CONVERSATIONS_BY_VER_RANGE = 'chat:getChatConversationsByVerRange',
}
