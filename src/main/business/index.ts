// Business层统一入口

// Chat模块
export { conversationBusiness } from './chat/conversation'
export { messageBusiness } from './chat/message'
export { userConversationBusiness } from './chat/user-conversation'

// Friend模块
export { friendBusiness } from './friend/friend'
export { friendVerifyBusiness } from './friend/friend-verify'

// Group模块
export { groupBusiness } from './group/group'

// User模块
export { userBusiness } from './user/user'

// Notification模块
export { notificationInboxBusiness } from './notification/inbox'
export { notificationReadCursorBusiness } from './notification/read-cursor'
export { notificationEventBusiness } from './notification/event'

// Emoji模块（按表拆分，按需各自引用）
