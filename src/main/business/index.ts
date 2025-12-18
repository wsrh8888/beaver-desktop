// Business层统一入口

// Chat模块
export { default as conversationBusiness } from './chat/conversation'
export { default as messageBusiness } from './chat/message'
export { default as userConversationBusiness } from './chat/user-conversation'

// Friend模块
export { default as friendBusiness } from './friend/friend'
export { default as friendVerifyBusiness } from './friend/friend-verify'

// Group模块
export { default as groupBusiness } from './group/group'

// User模块
export { default as userBusiness } from './user/user'

// Notification模块
export { default as notificationInboxBusiness } from './notification/inbox'
export { default as notificationReadCursorBusiness } from './notification/read-cursor'
export { default as notificationEventBusiness } from './notification/event'

// Emoji模块（按表拆分，按需各自引用）
