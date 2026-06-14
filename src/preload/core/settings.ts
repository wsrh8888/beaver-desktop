import type { IUserSettings } from 'commonModule/type/settings'
import type { ISettingsModule } from 'commonModule/type/preload'
import { SettingsCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const settingsModule: ISettingsModule = {
  get: () => {
    return ipcRenderManager.invoke<IUserSettings>(
      IEvent.RenderToMainSyncMsg,
      SettingsCommand.SETTINGS_GET,
      {},
    )
  },
  update: (settings: IUserSettings) => {
    return ipcRenderManager.invoke<IUserSettings>(
      IEvent.RenderToMainSyncMsg,
      SettingsCommand.SETTINGS_UPDATE,
      { settings },
    )
  },
}
