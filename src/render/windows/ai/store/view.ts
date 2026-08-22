import { defineStore } from 'pinia'

export type AiInputMode = 'text' | 'voice'
export type AiMainView = 'chat' | 'skill'
export type AiSkillTab = 'plaza' | 'mine'

export const useAiViewStore = defineStore('useAiViewStore', {
  state: () => ({
    inputMode: 'text' as AiInputMode,
    mainView: 'chat' as AiMainView,
    skillTab: 'plaza' as AiSkillTab,
    segmentText: '',
    speakingText: '',
    isListening: false,
    isVoiceSessionActive: false,
  }),
  getters: {
    isTextMode: state => state.inputMode === 'text',
    isVoiceMode: state => state.inputMode === 'voice',
    isChatView: state => state.mainView === 'chat',
    isSkillView: state => state.mainView === 'skill',
  },
  actions: {
    setInputMode(mode: AiInputMode) {
      this.inputMode = mode
      this.mainView = 'chat'
      if (mode === 'text')
        this.resetVoiceUi()
    },
    openSkillStore(tab: AiSkillTab = 'plaza') {
      this.skillTab = tab
      this.mainView = 'skill'
    },
    closeSkillStore() {
      this.mainView = 'chat'
    },
    setSkillTab(tab: AiSkillTab) {
      this.skillTab = tab
    },
    resetVoiceUi() {
      this.segmentText = ''
      this.speakingText = ''
      this.isListening = false
      this.isVoiceSessionActive = false
    },
    setListening(listening: boolean) {
      this.isListening = listening
    },
    setVoiceSessionActive(active: boolean) {
      this.isVoiceSessionActive = active
      if (!active)
        this.resetVoiceUi()
    },
    setSegmentText(text: string) {
      this.segmentText = text
    },
    setSpeakingText(text: string) {
      this.speakingText = text
    },
  },
})
