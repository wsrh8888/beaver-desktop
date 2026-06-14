import type { IUserSettings, KeyboardActionId } from 'commonModule/type/settings'
import { SettingsCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import { getUserSettingsApi } from 'mainModule/api/user'
import keyboardHandler from 'mainModule/ipc/render-to-main/keyboard'

class SettingsHandler {
  async init() {
    const res = await getUserSettingsApi()
    if (res.code !== 0 || !res.result) {
      return
    }
    this.saveToStore(res.result)
    ;(Object.keys(res.result.keyboard) as KeyboardActionId[]).forEach((actionId) => {
      keyboardHandler.set(actionId, res.result!.keyboard[actionId])
    })
  }

  private saveToStore(settings: IUserSettings) {
    store.set('settings', {
      ...settings,
      keyboard: { ...settings.keyboard },
    }, { persist: true })
  }

  async handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: SettingsCommand | string,
    data?: { settings?: IUserSettings },
  ): Promise<IUserSettings | void> {
    switch (command) {
      case SettingsCommand.SETTINGS_INIT:
        await this.init()
        return void 0
      case SettingsCommand.SETTINGS_GET:
        return store.get('settings')!
      case SettingsCommand.SETTINGS_UPDATE:
        if (!data?.settings) {
          return store.get('settings')!
        }
        this.saveToStore(data.settings)
        return data.settings
      default:
        console.error(`设置处理未知命令: ${command}`)
    }
  }
}

export default new SettingsHandler()
