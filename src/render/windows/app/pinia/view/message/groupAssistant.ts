import { defineStore } from 'pinia'

export const useGroupAssistantViewStore = defineStore('useGroupAssistantViewStore', {
  state: () => ({
    visible: false,
    groupId: '',
    /** 有值则进入对应类型详情，无值则走添加流程 */
    groupBotId: "",
    /** 群助手集成类型：custom / gitlab / jenkins 等，对应服务端 type 字段 */
    groupBotType: '',
  }),
  getters: {
    // 当前模式是创建还是编辑
    getCurrentMode: (state) => {
      if (state.groupBotId) {
        return 'edit'
      } else {
        return 'create'
      }
    },
  },

  actions: {
    close() {
      this.visible = false
      this.groupId = ''
      this.groupBotId = ''
      this.groupBotType = ''
    },
  },
})
