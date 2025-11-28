// 使用统一的初始化入口
export { initTables } from '../init'

export { chatConversations } from './chat/conversation'
// 聊天相关表
export { chats } from './chat/message'
export { chatSyncStatus } from './chat/sync-status'
export { chatUserConversations } from './chat/user-conversation'

export { emojiCollect } from './emoji/collect'
// 表情相关表
export { emoji } from './emoji/emoji'

export { emojiPackage } from './emoji/package'
export { emojiPackageCollect } from './emoji/package_collect'
export { emojiPackageEmoji } from './emoji/package_emoji'
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
