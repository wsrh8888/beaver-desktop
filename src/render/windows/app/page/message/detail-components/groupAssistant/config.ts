export type BotTemplateKey = 'custom' | 'gitlab'

export interface IBotTypeOption {
  key: string
  label: string
}

export interface IBotTemplateOption {
  key: BotTemplateKey
  name: string
  desc: string
  avatarText: string
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
    avatarText: '自',
    preset: {
      name: '',
      description: '',
    },
  },
  {
    key: 'gitlab',
    name: 'GitLab',
    desc: '基于 Git 的开源软件托管软件',
    avatarText: 'G',
    preset: {
      name: 'GitLab 机器人',
      description: '接收 GitLab Pipeline / Push 等事件通知',
    },
  },
]
