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
import type { IAiSkill } from 'renderModule/windows/ai/types/skill'

const PLAZA_SKILLS: IAiSkill[] = [
  {
    id: 'general',
    name: '通用助手',
    desc: '日常问答、写作与思路整理',
    tag: '官方',
    installed: true,
  },
  {
    id: 'im-summary',
    name: 'IM 会话总结',
    desc: '读取指定会话，提炼要点与待办',
    tag: '官方',
    installed: true,
  },
  {
    id: 'im-search',
    name: '消息搜索',
    desc: '自然语言查找历史消息与联系人',
    tag: '官方',
    installed: false,
  },
  {
    id: 'im-reply',
    name: '智能写回复',
    desc: '结合上下文生成礼貌、清晰的回复草稿',
    tag: '官方',
    installed: false,
  },
  {
    id: 'im-agent',
    name: 'IM 办事',
    desc: '代发消息、建群等 Agent 能力（需确认）',
    tag: '高级',
    installed: false,
  },
]

export const useAiSkillStore = defineStore('useAiSkillStore', {
  state: () => ({
    skills: PLAZA_SKILLS.map(item => ({ ...item })),
    activeSkillId: 'general' as string,
  }),
  getters: {
    plazaSkills: state => state.skills,
    mySkills: state => state.skills.filter(item => item.installed),
    activeSkill(state): IAiSkill | undefined {
      return state.skills.find(item => item.id === state.activeSkillId)
    },
  },
  actions: {
    installSkill(skillId: string) {
      const target = this.skills.find(item => item.id === skillId)
      if (target)
        target.installed = true
    },
    uninstallSkill(skillId: string) {
      const target = this.skills.find(item => item.id === skillId)
      if (target && target.id !== 'general')
        target.installed = false
    },
    selectSkill(skillId: string) {
      this.activeSkillId = skillId
    },
  },
})
