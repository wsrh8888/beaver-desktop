import type { INotificationBotItem } from 'commonModule/type/ajax/group'
import type { BotTemplateKey } from 'renderModule/windows/app/page/message/detail-components/groupAssistant/config'
import { botTemplateOptions, botTypeOptions } from 'renderModule/windows/app/page/message/detail-components/groupAssistant/config'
import { defineStore } from 'pinia'

export type GroupAssistantView = 'picker' | 'custom' | 'detail'
export type GroupAssistantMode = 'create' | 'edit'

interface IAssistantForm {
  name: string
  description: string
  avatar: string
}

const emptyForm = (): IAssistantForm => ({
  name: '',
  description: '',
  avatar: '',
})

export const useGroupAssistantViewStore = defineStore('useGroupAssistantViewStore', {
  state: () => ({
    visible: false,
    /** 当前弹窗内展示的子组件 */
    view: null as GroupAssistantView | null,
    /** 创建 / 编辑 */
    mode: 'create' as GroupAssistantMode,
    groupId: '',
    creatorUserId: '',
    selectedBotType: botTypeOptions[0]?.key || 'notification',
    selectedTemplate: 'custom' as BotTemplateKey,
    form: emptyForm(),
    activeBot: null as INotificationBotItem | null,
    oneTimeSecret: '',
    enabled: true,
    /** 列表刷新计数，assistant 页 watch */
    listRefreshKey: 0,
  }),

  getters: {
    headerTitle(state): string {
      if (state.view === 'custom')
        return '自定义机器人'
      if (state.view === 'detail')
        return '管理群助手'
      return '添加群助手'
    },

    showHeaderBack(): boolean {
      return true
    },
  },

  actions: {
    openPicker(groupId: string, creatorUserId: string) {
      this.groupId = groupId
      this.creatorUserId = creatorUserId
      this.mode = 'create'
      this.view = 'picker'
      this.selectedBotType = botTypeOptions[0]?.key || 'notification'
      this.form = emptyForm()
      this.activeBot = null
      this.oneTimeSecret = ''
      this.enabled = true
      this.visible = true
    },

    openCustom(template: BotTemplateKey) {
      const item = botTemplateOptions.find(t => t.key === template)
      this.selectedTemplate = template
      this.mode = 'create'
      this.view = 'custom'
      if (item) {
        this.form = {
          name: item.preset.name,
          description: item.preset.description,
          avatar: '',
        }
      }
      else {
        this.form = emptyForm()
      }
    },

    openDetail(bot: INotificationBotItem, groupId: string, creatorUserId: string) {
      this.groupId = groupId
      this.creatorUserId = creatorUserId
      this.activeBot = bot
      this.mode = 'edit'
      this.view = 'detail'
      this.form = {
        name: bot.name,
        description: bot.description,
        avatar: bot.avatar,
      }
      this.enabled = bot.status === 1
      this.oneTimeSecret = ''
      this.visible = true
    },

    headerBack() {
      if (this.view === 'custom' || this.view === 'detail')
        this.view = 'picker'
      else
        this.close()
    },

    close() {
      this.visible = false
      this.view = null
      this.mode = 'create'
      this.groupId = ''
      this.creatorUserId = ''
      this.form = emptyForm()
      this.activeBot = null
      this.oneTimeSecret = ''
      this.enabled = true
    },

    notifyListChanged() {
      this.listRefreshKey += 1
    },
  },
})
