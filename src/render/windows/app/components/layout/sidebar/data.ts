import chatSvg from 'renderModule/assets/image/leftBar/chat.svg'
import chatActive from 'renderModule/assets/image/leftBar/chat_active.svg'
import friendSvg from 'renderModule/assets/image/leftBar/friend.svg'
import friendActive from 'renderModule/assets/image/leftBar/friend_active.svg'
import momentSvg from 'renderModule/assets/image/leftBar/moment.svg'
import momentActive from 'renderModule/assets/image/leftBar/moment_active.svg'
import assistantSvg from 'renderModule/assets/image/leftBar/assistant.svg'
import assistantActive from 'renderModule/assets/image/leftBar/assistant_active.svg'
import logoutIcon from 'renderModule/assets/image/leftBar/settings/logout.svg'
import profileIcon from 'renderModule/assets/image/leftBar/settings/profile.svg'
import settingsIcon from 'renderModule/assets/image/leftBar/settings/settings.svg'

export const outsideList = [
  {
    id: 'message',
    title: '聊天',
    defaultIcon: chatSvg,
    activeIcon: chatActive,
    router: '/message',
  },
  {
    id: 'friend',
    router: '/friend',
    title: '好友',
    defaultIcon: friendSvg,
    activeIcon: friendActive,
    badgeCategories: ['social', 'group'],
  },
  {
    id: 'ai',
    title: 'AI助手',
    defaultIcon: assistantSvg,
    activeIcon: assistantActive,
  },
  {
    id: 'moment',
    router: '/moment',
    title: '朋友圈',
    defaultIcon: momentSvg,
    activeIcon: momentActive,
    badgeCategories: ['moment'],
  },
]

export const userInfoMenuList = [
  {
    key: 'profile',
    label: '个人资料',
    icon: profileIcon,
  },
  {
    key: 'settings',
    label: '设置',
    icon: settingsIcon,
  },
  {
    key: 'logout',
    label: '退出',
    icon: logoutIcon,
  },
]
