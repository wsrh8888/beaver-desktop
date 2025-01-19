import { defineStore } from 'pinia';
import { IGroupInfo } from 'commonModule/type/ajax/group';
import { getGroupListApi } from 'renderModule/api/group';

export const useGroupStore = defineStore('useGroupStore', {
  state: (): { groupList: IGroupInfo[], groupMap: Map<string, IGroupInfo> } => ({
    /**
     * @description: 最近日聊天列表
     */
    groupList: [],
    /**
     * @description: 群列表Map形式
     */    
    groupMap: new Map()
  }),
  getters: {
  },
  actions: {
    reset() {
      this.groupList = [];
      this.groupMap = new Map();
    },
    /**
     * @description: 获取最近聊天列表
     */
    async initGroupListApi() {
      const getGroupApi = await getGroupListApi();
      if (getGroupApi.code === 0) {
        this.groupList = getGroupApi.result.list;
        this.convertGroupListToMap();
      }
    },
    
    /**
     * @description: 将groupList转换为Map形式
     */
    convertGroupListToMap() {
      const groupMap = new Map();
      this.groupList?.forEach((group: IGroupInfo) => {
        groupMap.set(group.conversationId, group);
      });
      this.groupMap = groupMap;
    },
  },
});

