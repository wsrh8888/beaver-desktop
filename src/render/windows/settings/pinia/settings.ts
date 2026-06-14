import type {
  IUserSettingsNotification,
  IUserSettingsPrivacy,
} from 'commonModule/type/ajax/user'
import type { IUserSettings, KeyboardActionId } from 'commonModule/type/mainStore'
import { updateUserSettingsApi } from 'renderModule/api/user'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('useSettingsStore', {
  state: () => ({
    settings: null as IUserSettings | null,
  }),

  actions: {
    async init() {
      this.settings = await electron.settings.get()
    },

    async save() {
      if (!this.settings) {
        return
      }
      this.settings = await electron.settings.update({
        privacy: { ...this.settings.privacy },
        notification: { ...this.settings.notification },
        keyboard: { ...this.settings.keyboard },
      })
    },

    async updatePrivacy(key: keyof IUserSettingsPrivacy, value: boolean): Promise<boolean> {
      if (!this.settings) {
        return false
      }
      const prev = this.settings.privacy[key]
      this.settings.privacy[key] = value
      const res = await updateUserSettingsApi({ privacy: { [key]: value } })
      if (res.code !== 0) {
        this.settings.privacy[key] = prev
        return false
      }
      await this.save()
      return true
    },

    async updateNotification(key: keyof IUserSettingsNotification, value: boolean): Promise<boolean> {
      if (!this.settings) {
        return false
      }
      const prev = this.settings.notification[key]
      this.settings.notification[key] = value
      const res = await updateUserSettingsApi({ notification: { [key]: value } })
      if (res.code !== 0) {
        this.settings.notification[key] = prev
        return false
      }
      await this.save()
      return true
    },

    async updateKeyboard(actionId: KeyboardActionId, binding: string): Promise<boolean> {
      if (!this.settings) {
        return false
      }
      const prev = this.settings.keyboard[actionId]
      this.settings.keyboard[actionId] = binding
      const res = await updateUserSettingsApi({ keyboard: { [actionId]: binding } })
      if (res.code !== 0) {
        console.error('快捷键接口保存失败', res.msg)
        this.settings.keyboard[actionId] = prev
        return false
      }
      try {
        await this.save()
        await electron.keyboard.set(actionId, binding)
        return true
      }
      catch (error) {
        console.error('快捷键保存失败', error)
        this.settings.keyboard[actionId] = prev
        return false
      }
    },
  },
})
