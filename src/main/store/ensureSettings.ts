import type { IStore } from 'commonModule/type/mainStore'
import { defaultAccountSettings, defaultDeviceSettings } from 'commonModule/type/settings'

export function ensureSettingsDefaults(store: IStore) {
  if (!store.get('accountSettings')) {
    store.set('accountSettings', defaultAccountSettings, { persist: true })
  }
  if (!store.get('deviceSettings')) {
    store.set('deviceSettings', defaultDeviceSettings, { persist: true })
  }
}
