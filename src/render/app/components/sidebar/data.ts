import chatSvg from 'renderModule/assets/image/leftBar/chat.png'
import chatActive from 'renderModule/assets/image/leftBar/chat_active.png'
import friendSvg from 'renderModule/assets/image/leftBar/friend.png'
import friendActive from 'renderModule/assets/image/leftBar/friend_active.png'


export const outsideList = [
  {
    id: "message",
    title: "消息",
    defaultIcon: chatSvg,
    activeIcon: chatActive,
    router: "/message",
  },
  {
    id: "contact",
    router: "/contact",
    title: "通讯录",
    defaultIcon: friendSvg,
    activeIcon: friendActive,
  },
];