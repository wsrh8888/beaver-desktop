import chatSvg from 'renderModule/assets/image/leftBar/chat.svg'
import chatActive from 'renderModule/assets/image/leftBar/chat_active.svg'
import friendSvg from 'renderModule/assets/image/leftBar/friend.svg'
import friendActive from 'renderModule/assets/image/leftBar/friend_active.svg'
import momentSvg from 'renderModule/assets/image/leftBar/moment.svg'
import momentActive from 'renderModule/assets/image/leftBar/moment_active.svg'
import aboutIcon from 'renderModule/assets/image/leftBar/settings/about.svg'
import logoutIcon from 'renderModule/assets/image/leftBar/settings/logout.svg'
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
  },
  {
    id: 'moment',
    router: '/moment',
    title: '朋友圈',
    defaultIcon: momentSvg,
    activeIcon: momentActive,
  },
]

export const userInfoMenuList = [
  {
    key: 'profile',
    label: '个人资料',
    icon: settingsIcon,
  },
  {
    key: 'about',
    label: '关于海狸',
    icon: aboutIcon,
  },
  {
    key: 'logout',
    label: '退出',
    icon: logoutIcon,
  },
]
