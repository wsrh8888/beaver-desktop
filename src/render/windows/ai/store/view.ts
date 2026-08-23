/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
