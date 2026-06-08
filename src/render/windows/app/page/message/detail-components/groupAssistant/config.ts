import customAvatar from 'renderModule/assets/image/groupAssistant/custom.svg'
/** 与服务端 GroupBotModel.type 一致 */
export type GroupBotType = 'custom' | 'gitlab' | ''

export type BotTemplateKey = GroupBotType

export interface IBotTypeOption {
  key: string
  label: string
}

export interface IBotTemplateOption {
  key: BotTemplateKey
  name: string
  desc: string
  avatar: string
  preset: {
    name: string
    description: string
  }
}

/** 助手类型（第二行可选列表，目前仅通知机器人） */
export const botTypeOptions: IBotTypeOption[] = [
  {
    key: 'notification',
    label: '通知机器人',
  },
]

/** 第三行模板卡片（一行两个） */
export const botTemplateOptions: IBotTemplateOption[] = [
  {
    key: 'custom',
    name: '自定义机器人',
    desc: '通过 Webhook 自定义服务',
    avatar: customAvatar,
    preset: {
      name: '',
      description: '',
    },
  },
]
