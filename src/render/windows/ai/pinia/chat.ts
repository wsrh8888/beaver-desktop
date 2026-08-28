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
import type { IAiMessage, IAiTask, IAiTaskListItem } from 'renderModule/windows/ai/types/chat'
import { useAiSpaceStore } from 'renderModule/windows/ai/pinia/space'

const DRAFT_ID = 'draft'

/**
 * 1. 新建 → /new 草稿（不进侧栏）
 * 2. 发送：
 *    - 未选空间 → 云端「任务」
 *    - 选了本机空间 → 该空间下的「会话」
 * 3. 侧栏点条目 → /task/:id
 */
export const useAiChatStore = defineStore('useAiChatStore', {
  state: () => ({
    taskList: [] as IAiTaskListItem[],
    currentTaskId: DRAFT_ID,
    tasks: {
      [DRAFT_ID]: {
        id: DRAFT_ID,
        title: '新任务',
        timestamp: Date.now(),
        spaceId: null,
        skillId: 'general',
        messages: [],
      },
    } as Record<string, IAiTask>,
  }),
  getters: {
    isDraft(state): boolean {
      return state.currentTaskId === DRAFT_ID
    },
    currentTask(state): IAiTask | undefined {
      return state.tasks[state.currentTaskId]
    },
    /** 云端任务（无空间） */
    cloudTasks(state): IAiTaskListItem[] {
      return state.taskList.filter(item => item.spaceId === null)
    },
    /** 某本机空间下的会话 */
    sessionsBySpace(state): Record<string, IAiTaskListItem[]> {
      const map: Record<string, IAiTaskListItem[]> = {}
      for (const item of state.taskList) {
        if (!item.spaceId)
          continue
        if (!map[item.spaceId])
          map[item.spaceId] = []
        map[item.spaceId].push(item)
      }
      return map
    },
  },
  actions: {
    createId() {
      return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    },

    openTask(id: string) {
      if (!this.tasks[id] || id === DRAFT_ID)
        return false
      this.currentTaskId = id
      return true
    },

    startNewTask(skillId = 'general') {
      const spaceStore = useAiSpaceStore()
      this.currentTaskId = DRAFT_ID
      this.tasks[DRAFT_ID] = {
        id: DRAFT_ID,
        title: '新任务',
        timestamp: Date.now(),
        spaceId: spaceStore.resolveTargetSpaceId(),
        skillId,
        messages: [],
      }
    },

    promoteDraft(title: string, spaceId: string | null) {
      const draft = this.tasks[DRAFT_ID]
      if (!draft)
        return DRAFT_ID

      const newId = this.createId()
      const now = Date.now()
      const task: IAiTask = {
        id: newId,
        title,
        timestamp: now,
        spaceId,
        skillId: draft.skillId || 'general',
        messages: [],
      }
      this.tasks[newId] = task
      this.taskList.unshift({
        id: newId,
        title,
        timestamp: now,
        spaceId,
      })
      this.currentTaskId = newId

      this.tasks[DRAFT_ID] = {
        id: DRAFT_ID,
        title: '新任务',
        timestamp: now,
        spaceId: spaceId,
        skillId: draft.skillId || 'general',
        messages: [],
      }

      return newId
    },

    touchTask(id: string) {
      const item = this.taskList.find(c => c.id === id)
      if (item)
        item.timestamp = Date.now()
      if (this.tasks[id])
        this.tasks[id].timestamp = Date.now()
    },

    appendUserMessage(taskId: string, content: string) {
      const task = this.tasks[taskId]
      if (!task || !content.trim())
        return

      task.messages.push({
        id: this.createId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      })
      this.touchTask(taskId)
    },

    appendAssistantReply(taskId: string, fullText: string) {
      const task = this.tasks[taskId]
      if (!task)
        return

      const msg: IAiMessage = {
        id: this.createId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      }
      task.messages.push(msg)

      let index = 0
      const timer = window.setInterval(() => {
        index += 1
        msg.content = fullText.slice(0, index)
        if (index >= fullText.length) {
          msg.streaming = false
          window.clearInterval(timer)
        }
      }, 20)

      this.touchTask(taskId)
    },

    sendTextMessage(text: string): string | null {
      const content = text.trim()
      if (!content)
        return null

      const spaceStore = useAiSpaceStore()
      let taskId = this.currentTaskId

      if (taskId === DRAFT_ID) {
        const spaceId = spaceStore.resolveTargetSpaceId()
        const title = content.slice(0, 16)
        taskId = this.promoteDraft(title, spaceId)
      }

      this.appendUserMessage(taskId, content)
      this.appendAssistantReply(
        taskId,
        `我已收到：「${content}」。任务已开始，AI 服务接入后将在此流式回复，并在右侧展示产物。`,
      )

      return taskId
    },
  },
})
