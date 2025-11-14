import { defineStore } from 'pinia'

/**
 * @description: 好友视图状态管理
 */
export const useFriendViewStore = defineStore('useFriendViewStore', {
  state: () => ({
    /**
     * @description: 当前选中的项目ID
     */
    selectedId: null as string | null,
    /**
     * @description: 当前选中的类型（friend 或 group）
     */
    selectedType: null as 'friend' | 'group' | 'friend-notification' | 'group-notification' | null,
    /**
     * @description: 当前选中的标签页（friends 或 groups）
     */
    currentTab: 'friends' as string,
    /**
     * @description: 当前显示的弹窗类型
     */
    currentDialog: null as string | null,
  }),

  actions: {
    /**
     * @description: 设置当前选中的项目（包含类型）
     */
    setSelectedConversationWithType(id: string, type: 'friend' | 'group' | 'friend-notification' | 'group-notification') {
      this.selectedId = id
      this.selectedType = type
    },

    /**
     * @description: 设置当前标签页
     */
    setCurrentTab(tab: string) {
      this.currentTab = tab
    },

    /**
     * @description: 显示/隐藏弹窗
     */
    showDialog(dialogType: string | null) {
      this.currentDialog = dialogType
    },
  },
})
