import type { IUserSettingsKeyboard, IUserSettingsRes } from '../ajax/user'

export type { IUserSettingsKeyboard }

/** 设置里的快捷键 key */
export type KeyboardActionId = keyof IUserSettingsKeyboard

/** 用户设置（云端同步，主进程 store 缓存） */
export type IUserSettings = IUserSettingsRes
