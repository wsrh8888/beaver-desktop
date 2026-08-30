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
import { createAgentApi } from 'renderModule/api/agent'

const AGENT_ID_KEY = 'ai_agent_id'

/**
 * 当前用户默认 Agent 会话 id（createAgent 后缓存，发消息必带）。
 */
export const useAiAgentStore = defineStore('useAiAgentStore', {
  state: () => ({
    agentId: '' as string,
    ensuring: false,
  }),
  actions: {
    async ensureAgent(): Promise<string> {
      if (this.agentId)
        return this.agentId

      try {
        const cached = await electron.storage.getAsync(AGENT_ID_KEY)
        if (typeof cached === 'string' && cached) {
          this.agentId = cached
          return this.agentId
        }
      }
      catch {
        // ignore
      }

      if (this.ensuring) {
        // 简单等待并发创建结束
        for (let i = 0; i < 50; i++) {
          await new Promise(r => setTimeout(r, 100))
          if (this.agentId)
            return this.agentId
        }
      }

      this.ensuring = true
      try {
        const res = await createAgentApi({ name: '默认助手' })
        if (res.code !== 0 || !res.result?.agent?.agentId)
          throw new Error(res.msg || 'createAgent failed')
        this.agentId = res.result.agent.agentId
        try {
          await electron.storage.setAsync(AGENT_ID_KEY, this.agentId)
        }
        catch {
          // ignore
        }
        return this.agentId
      }
      finally {
        this.ensuring = false
      }
    },
  },
})
