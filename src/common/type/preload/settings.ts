import type { IAccountSettings, IDeviceSettings } from 'commonModule/type/settings'

export interface ISettingsModule {
  getAccount: () => Promise<IAccountSettings>
  getDevice: () => Promise<IDeviceSettings>
  saveAccount: (account: IAccountSettings) => Promise<IAccountSettings>
  saveDevice: (device: IDeviceSettings) => Promise<IDeviceSettings>
}
