import { defineStore } from 'pinia';

import { useFriendStore } from '../friend/friend';
import { useChatStore } from '../chat/chat';
import { useUserStore } from '../user/user';
import { useGroupStore } from '../group/group';
import { getAuthenticationApi } from 'renderModule/api/auth';

export const useInitStore = defineStore('useInitStore', {
  state: () => ({
    
  }),
  getters: {
  },
  actions: {
    getAuthentication() {
      getAuthenticationApi()
      .then(res => {
        if (res.code === 1) {
          console.error('ffffffffffffffffffffffffffffffffffffffffffffffffff')
          window.electron?.openWindow("login");
        }
      }).catch(() =>{
        console.error('鉴权失败')
      })
    },
    async initApp() {
      const friendStore = useFriendStore();
      const chatStore = useChatStore();
      const userStore = useUserStore();
      const groupStore = useGroupStore();
      this.getAuthentication()
      // 开始初始化整个项目
      // if (!getLocal('token')) {
      //   return
      // }
      // // 连接ws
      // WsManager.initSocket()

      await userStore.initUserInfoApi()

      // 初始化好友列表
      await friendStore.initFriendApi()

      // 初始化最近聊天列表
      await chatStore.initRecentChatApi()

      // 初始化群列表
      await groupStore.initGroupListApi()

      // 增加鉴权轮询
      setInterval(() => {
        this.getAuthentication()
      }, 10000)
      
    }
  },
});
