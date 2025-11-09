// 使用统一的初始化入口
export { initTables } from '../init'

export { chatConversations } from './chat/conversation'
// 聊天相关表
export { chats } from './chat/message'
export { chatSyncStatus } from './chat/sync-status'
export { chatUserConversations } from './chat/user-conversation'

// 好友相关表
export { friends } from './friend/friend'
export { friendVerifies } from './friend/friend_verify'

// 群组相关表
export { groups } from './group/groups'
export { groupJoinRequests } from './group/join-requests'
export { groupMembers } from './group/members'
export { groupSyncStatus } from './group/sync-status'

// 媒体表
export { media } from './media/media'

// 用户相关表
export * from './user/user'
