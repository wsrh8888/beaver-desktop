import chatSvg from 'renderModule/assets/image/leftBar/chat.svg'
import chatActive from 'renderModule/assets/image/leftBar/chat_active.svg'
import friendSvg from 'renderModule/assets/image/leftBar/friend.svg'
import friendActive from 'renderModule/assets/image/leftBar/friend_active.svg'

export const outsideList = [
  {
    id: "message",
    title: "聊天",
    defaultIcon: chatSvg,
    activeIcon: chatActive,
    router: "/message",
  },
  {
    id: "friend",
    router: "/friend",
    title: "好友",
    defaultIcon: friendSvg,
    activeIcon: friendActive,
  }
];