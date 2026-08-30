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

import type {
  ICreateAgentModelReq,
  ICreateAgentModelRes,
  ICreateAgentReq,
  ICreateAgentRes,
  IDeleteAgentModelReq,
  IDeleteAgentModelRes,
  IListAgentModelsReq,
  IListAgentModelsRes,
  IListOfficialModelsReq,
  IListOfficialModelsRes,
  ISendAgentMessageReq,
  IUpdateAgentModelReq,
  IUpdateAgentModelRes,
} from 'commonModule/type/ajax/agent'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 创建 Agent 会话
 */
export const createAgentApi = (data: ICreateAgentReq) => {
  return ajax<ICreateAgentRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/createAgent`,
    data,
  })
}

/**
 * @description: 创建用户自定义模型
 */
export const createAgentModelApi = (data: ICreateAgentModelReq) => {
  return ajax<ICreateAgentModelRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/createModel`,
    data,
  })
}

/**
 * @description: 获取当前用户自定义模型列表
 */
export const listAgentModelsApi = (data: IListAgentModelsReq = {}) => {
  return ajax<IListAgentModelsRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/listModels`,
    data,
  })
}

/**
 * @description: 更新用户自定义模型
 */
export const updateAgentModelApi = (data: IUpdateAgentModelReq) => {
  return ajax<IUpdateAgentModelRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/updateModel`,
    data,
  })
}

/**
 * @description: 删除用户自定义模型
 */
export const deleteAgentModelApi = (data: IDeleteAgentModelReq) => {
  return ajax<IDeleteAgentModelRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/deleteModel`,
    data,
  })
}

/**
 * @description: 获取平台官方模型列表（只读）
 */
export const listOfficialModelsApi = (data: IListOfficialModelsReq = {}) => {
  return ajax<IListOfficialModelsRes>({
    method: 'POST',
    url: `${baseUrl}/api/agent/v1/listOfficialModels`,
    data,
  })
}

export type AgentSseEventName = 'accepted' | 'delta' | 'lg' | 'done' | 'error'

export interface IAgentSseHandlers {
  onAccepted?: (data: { userMessageId?: string, seq?: number, status?: string }) => void
  onDelta?: (data: { content?: string, name?: string }) => void
  onLg?: (data: { name?: string, content?: string, dataJson?: string }) => void
  onDone?: (data: {
    assistantMessageId?: string
    seq?: number
    userMessageId?: string
    status?: string
    llmMetaJson?: string
    message?: string
  }) => void
  onError?: (data: { message?: string }) => void
}

/**
 * @description: 向 Agent 发消息（SSE：accepted → delta* → done|error）
 */
export async function sendAgentMessageStream(
  data: ISendAgentMessageReq,
  handlers: IAgentSseHandlers = {},
  signal?: AbortSignal,
): Promise<void> {
  let token = ''
  try {
    const userInfo = await electron.storage.getAsync('userInfo')
    token = userInfo?.token || ''
  }
  catch {
    token = ''
  }

  const res = await fetch(`${baseUrl}/api/agent/v1/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'source': 'beaver-desktop',
      'token': token,
      'deviceId': electron.app.devicedId || '',
      'env': electron.app.env || '',
      'version': electron.app.version || '',
    },
    body: JSON.stringify(data),
    signal,
  })

  if (!res.ok) {
    handlers.onError?.({ message: `HTTP ${res.status}` })
    return
  }
  if (!res.body) {
    handlers.onError?.({ message: 'empty stream body' })
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let eventName = ''
  let dataLines: string[] = []

  const flush = () => {
    if (!eventName && dataLines.length === 0)
      return
    const raw = dataLines.join('\n')
    eventName = eventName || 'message'
    dataLines = []
    let payload: any = {}
    if (raw) {
      try {
        payload = JSON.parse(raw)
      }
      catch {
        payload = { message: raw }
      }
    }
    const name = eventName as AgentSseEventName
    eventName = ''
    if (name === 'accepted')
      handlers.onAccepted?.(payload)
    else if (name === 'delta')
      handlers.onDelta?.(payload)
    else if (name === 'lg')
      handlers.onLg?.(payload)
    else if (name === 'done')
      handlers.onDone?.(payload)
    else if (name === 'error')
      handlers.onError?.(payload)
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split(/\r?\n/)
    buffer = parts.pop() || ''
    for (const line of parts) {
      if (line === '') {
        flush()
        continue
      }
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
        continue
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart())
      }
    }
  }
  flush()
}
