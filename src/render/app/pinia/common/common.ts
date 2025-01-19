import { defineStore } from 'pinia';
import { useFriendStore } from '../friend/friend';
import { useGroupStore } from '../group/group';
import { useChatStore } from '../chat/chat';
import { useUserStore } from '../user/user';
import { IConversationInfo } from 'commonModule/type/store/common';


export const useCommonStore = defineStore('useCommonStore', {
  state: () => ({}),
  getters: {
    /**
     * @description: 根据传入的Id获取会话信息，可能是friendMap或groupMap中的数据
     * @param {string} id - 会话的唯一标识符
     * @returns {IConversationInfo} 返回会话信息
     * @throws {Error} 如果没有找到会话信息，抛出错误
     */
    getConversationInfo: (state) => {
      return (id: string): IConversationInfo => {
        // 获取friendStore和groupStore的实例
        const friendStore = useFriendStore();
        const groupStore = useGroupStore();
        
        // 获取friendMap和groupMap
        const friendList = friendStore.friendList;
        const groupMap = groupStore.groupMap;

        // 根据Id从friendMap或groupMap中获取会话信息
        let index = friendList.findIndex(item => item.conversationId === id)
        console.error('11111111', friendList, id, index)
        if (index !== -1) {
          console.error(111, index);
          const result = friendList[index];
         
          console.log(111, result);
          return {
            conversationId: result.conversationId,
            title: result.nickname,
            avatar: result.avatar
          }
        } else if (groupMap.has(id)) {
          const result = groupMap.get(id);
          if (!result) {
            return {} as any
          }
          return  {
            conversationId: result.conversationId,
            title: result.title,
            avatar: result.avatar
          }
        } else {
          return {} as any
         }
      };
    },
    
  },
  actions: {
    resetApp() {
      const friendStore = useFriendStore();
      const groupStore = useGroupStore();
      const chatStore = useChatStore();
      const userStore = useUserStore();
      friendStore.reset()
      groupStore.reset()
      chatStore.reset()
      userStore.reset()
    }
  }
});


