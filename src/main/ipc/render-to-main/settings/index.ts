import type { IAccountSettings, IDeviceSettings } from 'commonModule/type/settings'
import { SettingsCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import { ensureSettingsDefaults } from 'mainModule/store/ensureSettings'

class SettingsHandler {
  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: SettingsCommand | string,
    data?: { account?: IAccountSettings, device?: IDeviceSettings },
  ): IAccountSettings | IDeviceSettings | void {
    ensureSettingsDefaults(store)

    switch (command) {
      case SettingsCommand.GET_ACCOUNT:
        return store.get('accountSettings')!
      case SettingsCommand.GET_DEVICE:
        return store.get('deviceSettings')!
      case SettingsCommand.SAVE_ACCOUNT:
        if (!data?.account) {
          return
        }
        store.set('accountSettings', data.account, { persist: true })
        return data.account
      case SettingsCommand.SAVE_DEVICE:
        if (!data?.device) {
          return
        }
        store.set('deviceSettings', {
          ...data.device,
          keyboard: { ...data.device.keyboard },
        }, { persist: true })
        return data.device
      default:
        console.error(`设置处理未知命令: ${command}`)
    }
  }
}

export default new SettingsHandler()
