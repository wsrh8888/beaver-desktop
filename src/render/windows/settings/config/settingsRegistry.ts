import type {
  IUserSettingsNotification,
  IUserSettingsPrivacy,
} from 'commonModule/type/ajax/user'
import type { KeyboardActionId } from 'commonModule/type/mainStore'

export type SettingsFieldType = 'devices' | 'toggle-group' | 'keyboard' | 'about'

export type SettingsToggleScope = 'privacy' | 'notification'

export type PrivacySettingsKey = keyof IUserSettingsPrivacy
export type NotificationSettingsKey = keyof IUserSettingsNotification

export type SettingsToggleKey = PrivacySettingsKey | NotificationSettingsKey

export interface IToggleFieldDef {
  scope: SettingsToggleScope
  key: SettingsToggleKey
  label: string
  desc: string
}

export interface IKeyboardFieldDef {
  id: KeyboardActionId
  label: string
  desc: string
}

export interface ISettingsSection {
  id: string
  label: string
  type: SettingsFieldType
  fields?: IToggleFieldDef[]
  keyboard?: IKeyboardFieldDef[]
}

export const settingsRegistry: ISettingsSection[] = [
  {
    id: 'account',
    label: '账号与存储',
    type: 'devices',
  },
  // {
  //   id: 'general',
  //   label: '通用',
  //   type: 'toggle-group',
  //   fields: [
  //     { scope: 'privacy', key: 'allowFriendRequest', label: '允许添加好友', desc: '关闭后他人无法向你发送好友申请' },
  //     { scope: 'privacy', key: 'showOnlineStatus', label: '展示在线状态', desc: '好友可以看到你是否在线' },
  //     { scope: 'privacy', key: 'allowSearchByPhone', label: '手机号搜索', desc: '允许他人通过手机号找到你' },
  //     { scope: 'privacy', key: 'allowSearchByEmail', label: '邮箱搜索', desc: '允许他人通过邮箱找到你' },
  //   ],
  // },
  {
    id: 'keyboard',
    label: '快捷键',
    type: 'keyboard',
    keyboard: [
      { id: 'sendMessage', label: '发送消息', desc: '在聊天输入框中发送当前内容' },
      { id: 'screenshot', label: '截图', desc: '打开区域截图工具' },
      { id: 'toggleWindow', label: '显示/隐藏主窗口', desc: '快速切换主窗口显示状态' },
    ],
  },
  // {
  //   id: 'notification',
  //   label: '通知',
  //   type: 'toggle-group',
  //   fields: [
  //     { scope: 'notification', key: 'notifyFriendRequest', label: '好友申请通知', desc: '收到好友申请时提醒' },
  //     { scope: 'notification', key: 'notifyGroupMessage', label: '群消息通知', desc: '收到群聊消息时提醒' },
  //     { scope: 'notification', key: 'notifyMoment', label: '朋友圈通知', desc: '朋友圈互动时提醒' },
  //   ],
  // },
  {
    id: 'about',
    label: '关于海狸',
    type: 'about',
  },
]

export function findSettingsSection(sectionId: string): ISettingsSection | undefined {
  return settingsRegistry.find(section => section.id === sectionId)
}

export function getDefaultActiveSectionId(): string {
  return settingsRegistry[0].id
}
