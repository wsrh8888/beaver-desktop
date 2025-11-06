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
}

export enum DataChatCommand {
  GET_RECENT_CHAT_LIST = 'chat:getRecentChatList',
  GET_CONVERSATION_INFO = 'chat:getConversationInfo',
  GET_CHAT_HISTORY = 'chat:getChatHistory',
  GET_CHAT_MESSAGES_BY_SEQ_RANGE = 'chat:getChatMessagesBySeqRange',
  GET_CHAT_CONVERSATIONS_BY_VER_RANGE = 'chat:getChatConversationsByVerRange',
}
