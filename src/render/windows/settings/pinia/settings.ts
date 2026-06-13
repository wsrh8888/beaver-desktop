import type { IUserSettingsNotification, IUserSettingsPrivacy } from 'commonModule/type/ajax/user'
import type { IAccountSettings, IDeviceSettings, KeyboardActionId } from 'commonModule/type/mainStore'
import { getUserSettingsApi, updateUserSettingsApi } from 'renderModule/api/user'
import { defineStore } from 'pinia'

export async function syncAccountSettings(): Promise<void> {
  const res = await getUserSettingsApi()
  if (res.code !== 0 || !res.result) {
    return
  }
  await electron.settings.saveAccount(res.result)
}

export const useSettingsStore = defineStore('useSettingsStore', {
  state: () => ({
    account: null as IAccountSettings | null,
    device: null as IDeviceSettings | null,
    isLoaded: false,
  }),

  actions: {
    async load() {
      this.account = await electron.settings.getAccount()
      this.device = await electron.settings.getDevice()
      this.isLoaded = true
    },

    async init() {
      await this.load()
      await syncAccountSettings()
      this.account = await electron.settings.getAccount()
    },

    async saveAccount() {
      if (!this.account) {
        return
      }
      this.account = await electron.settings.saveAccount(this.account)
    },

    async saveDevice() {
      if (!this.device) {
        return
      }
      this.device = await electron.settings.saveDevice(this.device)
    },

    async updatePrivacy(key: keyof IUserSettingsPrivacy, value: boolean): Promise<boolean> {
      if (!this.account) {
        return false
      }
      const prev = this.account.privacy[key]
      this.account.privacy[key] = value
      const res = await updateUserSettingsApi({ privacy: { [key]: value } })
      if (res.code !== 0) {
        this.account.privacy[key] = prev
        return false
      }
      await this.saveAccount()
      return true
    },

    async updateNotification(key: keyof IUserSettingsNotification, value: boolean): Promise<boolean> {
      if (!this.account) {
        return false
      }
      const prev = this.account.notification[key]
      this.account.notification[key] = value
      const res = await updateUserSettingsApi({ notification: { [key]: value } })
      if (res.code !== 0) {
        this.account.notification[key] = prev
        return false
      }
      await this.saveAccount()
      return true
    },

    async updateLocal(key: 'enableSound' | 'enableDesktopNotify', value: boolean): Promise<boolean> {
      if (!this.device) {
        return false
      }
      const prev = this.device[key]
      this.device[key] = value
      try {
        await this.saveDevice()
        return true
      }
      catch {
        this.device[key] = prev
        return false
      }
    },

    async updateKeyboard(actionId: KeyboardActionId, binding: string): Promise<boolean> {
      if (!this.device) {
        return false
      }
      const prev = this.device.keyboard[actionId]
      this.device.keyboard[actionId] = binding
      try {
        await this.saveDevice()
        await electron.keyboard.set(actionId, binding)
        return true
      }
      catch {
        this.device.keyboard[actionId] = prev
        return false
      }
    },
  },
})
