import type { IUserSettingsRes } from '../ajax/user'

export type KeyboardActionId = 'screenshot' | 'search' | 'toggleWindow'

/** 账号设置（云端同步，主进程 store 缓存） */
export type IAccountSettings = IUserSettingsRes

/** 本机设置（仅主进程 store / config.json） */
export interface IDeviceSettings {
  enableSound: boolean
  enableDesktopNotify: boolean
  keyboard: Record<KeyboardActionId, string>
}

export const defaultAccountSettings: IAccountSettings = {
  privacy: {
    allowFriendRequest: true,
    showOnlineStatus: true,
    allowSearchByPhone: true,
    allowSearchByEmail: true,
  },
  notification: {
    notifyFriendRequest: true,
    notifyGroupMessage: true,
    notifyMoment: true,
  },
}

export const defaultDeviceSettings: IDeviceSettings = {
  enableSound: true,
  enableDesktopNotify: true,
  keyboard: {
    screenshot: 'Ctrl+Alt+A',
    search: 'Ctrl+F',
    toggleWindow: 'Ctrl+Shift+H',
  },
}
