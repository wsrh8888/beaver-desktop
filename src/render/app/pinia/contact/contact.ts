import type { IContactUserInfo } from 'commonModule/type/pinia/contact'
import { defineStore } from 'pinia'

interface IContactState {
  contacts: Record<string, IContactUserInfo>
}

/**
 * @description: 全局用户信息
 */
export const useContactStore = defineStore('contactStore', {
  state: (): IContactState => ({
    contacts: {},
  }),

  getters: {

  },

  actions: {

    upsertContact(contact: IContactUserInfo) {
      this.contacts[contact.userId] = contact
    },
  },
})
