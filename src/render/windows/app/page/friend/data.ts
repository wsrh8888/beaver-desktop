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
    text: '加好友/群',
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

export const notificationList = [{
  key: 'friend-notification',
  text: '好友通知',
  badgeCategories: ['social'],
}, {
  key: 'group-notification',
  text: '群通知',
  badgeCategories: ['group'],
}]
