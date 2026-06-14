import { defineStore } from 'pinia'
import { findSettingsSection, getDefaultActiveSectionId } from 'renderModule/windows/settings/config/settingsRegistry'

export const useSettingsUiStore = defineStore('useSettingsUiStore', {
  state: () => ({
    activeSectionId: getDefaultActiveSectionId(),
  }),

  getters: {
    activeSection: state => findSettingsSection(state.activeSectionId),
  },

  actions: {
    setActiveSection(sectionId: string) {
      this.activeSectionId = sectionId
    },
  },
})
