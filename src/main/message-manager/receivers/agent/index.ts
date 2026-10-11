/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * AI agent 相关 ws 消息接收器。服务端下发 client_tool 事件（在本机执行一个 MCP 工具），
 * stream-receiver 识别 event==='client_tool' 后调本模块：解析 payload →
 * 调 mcp router 执行 → 回传 submitClientToolResult。
 *
 * 工作目录在服务端 agent_workspaces，这里不解析。
 * 云端会话服务端不绑 ClientSession，不会走到这里。
 *
 * 全程在主进程完成，不再转发渲染进程，不再经 IPC 往返。
 * 跟 chat/friend/group 等 receiver 同惯例：一种 ws 消息类型一个子目录。
 */
import path from 'node:path'
import type { IClientToolPayload } from 'commonModule/type/mcp'
import { submitClientToolResultApi } from 'mainModule/api/mcp'
import { getMcpManager } from 'mainModule/mcp'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const SPACE_KEY = 'ai_space_snapshot'

const logger = new Logger('agent-receiver')

type ToolResult = { ok: boolean, data?: Record<string, any>, error?: string }

/**
 * client_tool 接收器。有 server 和 tool 就直接执行，然后回传结果。
 */
class AgentReceiver {
  async handle(conversationId: string, dataJson: string): Promise<void> {
    const payload = this.parsePayload(dataJson)
    const requestId = payload.requestId || ''
    if (!requestId)
      return

    logger.info({
      text: '收到本机工具',
      data: {
        server: payload.server,
        tool: payload.tool,
        requestId,
        conversationId,
        workspaceId: payload.workspaceId || '',
        deviceId: payload.deviceId || '',
      },
    })

    if (payload.server && payload.tool) {
      const manager = await getMcpManager()
      const root = resolveToolRoot(payload)
      await this.submitResult(requestId, await manager.callTool(payload.server, payload.tool, payload.args || {}, root))
    }
    else {
      await this.submitResult(requestId, { ok: false, error: '缺少 server 或 tool' })
    }
  }

  private parsePayload(dataJson: string): IClientToolPayload {
    if (!dataJson)
      return {}
    try {
      return JSON.parse(dataJson)
    }
    catch (err: any) {
      logger.warn({ text: 'agent 事件 payload 解析失败', data: { error: err?.message } })
      return {}
    }
  }

  private async submitResult(requestId: string, result: ToolResult): Promise<void> {
    try {
      const res = await submitClientToolResultApi({
        requestId,
        ok: !!result.ok,
        data: result.data || {},
        error: result.error || '',
      })
      if (res.code !== 0)
        logger.warn({ text: '回传本机工具结果未成功', data: { requestId, code: res.code, msg: res.msg } })
    }
    catch (err: any) {
      logger.error({ text: '回传本机工具结果失败', data: { requestId, error: err?.message || String(err) } })
    }
  }
}

/** 本机空间目录优先；没有时，绝对路径工具用目标盘符当 root。 */
function resolveToolRoot(payload: IClientToolPayload): string {
  const fromSpace = pathOfSpace(payload.workspaceId || '')
  if (fromSpace)
    return fromSpace
  const reported = (payload.workspacePath || '').trim()
  if (reported && path.isAbsolute(reported))
    return path.resolve(reported)
  const argPath = String(payload.args?.path || '').trim()
  if (argPath && (path.isAbsolute(argPath) || /^[a-z]:/i.test(argPath)))
    return path.parse(path.resolve(argPath)).root
  return ''
}

function pathOfSpace(workspaceId: string): string {
  if (!workspaceId)
    return ''
  const raw = store.get(SPACE_KEY as never)
  const text = typeof raw === 'string' ? raw : ''
  if (!text)
    return ''
  try {
    const data = JSON.parse(text) as { spaces?: Array<{ id?: string, path?: string }> }
    const hit = data.spaces?.find(item => item.id === workspaceId)
    const dir = (hit?.path || '').trim()
    return dir && path.isAbsolute(dir) ? path.resolve(dir) : ''
  }
  catch {
    return ''
  }
}

export default new AgentReceiver()
