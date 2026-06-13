import type { IAccountSettings, IDeviceSettings } from 'commonModule/type/mainStore'
import type { ISettingsModule } from 'commonModule/type/preload/settings'
import { SettingsCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const settingsModule: ISettingsModule = {
  getAccount: () => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, SettingsCommand.GET_ACCOUNT, {})
  },
  getDevice: () => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, SettingsCommand.GET_DEVICE, {})
  },
  saveAccount: (account: IAccountSettings) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, SettingsCommand.SAVE_ACCOUNT, { account })
  },
  saveDevice: (device: IDeviceSettings) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, SettingsCommand.SAVE_DEVICE, { device })
  },
}
