import type { IUserSettings } from 'commonModule/type/settings'

export interface ISettingsModule {
  get: () => Promise<IUserSettings>
  update: (settings: IUserSettings) => Promise<IUserSettings>
}
