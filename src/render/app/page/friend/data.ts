// 好友页面数据配置
import addFriendIcon from 'renderModule/assets/image/friend/user-plus.svg'
import createGroupIcon from 'renderModule/assets/image/friend/users.svg'

// 选项卡配置
export const TABS_CONFIG = [
  { key: 'friends', name: '好友' },
  { key: 'groups', name: '群聊' },
]

// 弹窗菜单配置
export const POPUP_MENU_CONFIG = [
  {
    key: 'add-friend',
    text: '添加好友',
    icon: addFriendIcon,
    action: 'add-friend',
  },
  {
    key: 'create-group',
    text: '创建群聊',
    icon: createGroupIcon,
    action: 'create-group',
  },
]

// 弹窗类型常量
export const DIALOG_TYPES = {
  CREATE_GROUP: 'create-group',
  APPLY_FRIEND: 'apply-friend',
} as const

// 搜索类型常量
export const SEARCH_TYPES = {
  EMAIL: 'email',
  USER_ID: 'id',
} as const

export const notificationList = [{
  key: 'friend-notification',
  text: '好友通知',
}]
// , {
//   key: 'group-notification',
//   text: '群通知',
// }
