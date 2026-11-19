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
 * 真 MCP 工具全程在主进程执行，不经 IPC 往返。
 * 例外是 beaver/confirm_send（agent 代发消息）：它不是工具，需要人点确认，
 * 所以转成 MCP_CONFIRM 通知交给 AI 侧栏，在输入区上方渲染确认卡
 * （卡片只管形态，标题与按钮文案由 args 带，以后换删除等动作不用改这里），
 * 用户点击后由渲染进程直接回传结果（同样走 submit_client_tool_result）。
 * 跟 chat/friend/group 等 receiver 同惯例：一种 ws 消息类型一个子目录。
 */
import path from 'node:path'
import type { IClientToolPayload } from 'commonModule/type/mcp'
import { NotificationMcpConfirmCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { BrowserWindow } from 'electron'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { submitClientToolResultApi } from 'mainModule/api/mcp'
import { getMcpManager } from 'mainModule/mcp'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const SPACE_KEY = 'ai_space_snapshot'

/** 确认卡的有效期：与服务端 request_client_tool 的 120s 超时对齐。 */
const CONFIRM_TTL_MS = 120_000

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

    const targetId = (payload.deviceId || '').trim()
    const localId = process.custom?.DEVICE_ID || ''
    if (targetId && localId && targetId !== localId) {
      logger.info({
        text: '本机工具发给其他电脑，跳过',
        data: { requestId, targetId, localId },
      })
      return
    }

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

    // agent 代发消息的硬确认：不是真 MCP 工具，交给 AI 侧栏渲染确认卡。
    // 用户在卡片上点主按钮才回传 approved=true，agent 才会真正把消息发出去；
    // 拒绝、超时、窗口不在，一律不发。
    if (payload.server === 'beaver' && payload.tool === 'confirm_send') {
      await this.requestConfirmSend(requestId, payload, conversationId)
      return
    }

    if (payload.server && payload.tool) {
      const manager = await getMcpManager()
      const root = resolveToolRoot(payload)
      await this.submitResult(requestId, await manager.callTool(payload.server, payload.tool, payload.args || {}, root))
    }
    else {
      await this.submitResult(requestId, { ok: false, error: '缺少 server 或 tool' })
    }
  }

  /**
   * 需要人点头的本机动作：把待办推给 AI 侧栏，由渲染进程在输入区上方渲染确认卡。
   * 标题与按钮文案优先取 agent 传来的 args，缺省按代发语义兜底——
   * 卡片本身不认识「发送」还是「删除」，这里也不判断，一律原样下发。
   * 卡片点击后由渲染进程直接回传结果，这里只负责下发；没有窗口时立即判否，
   * 不让服务端干等满 120 秒。
   */
  private async requestConfirmSend(requestId: string, payload: IClientToolPayload, conversationId: string): Promise<void> {
    const args = payload.args || {}
    const content = String(args.content || '')
    logger.info({ text: '下发确认卡', data: { requestId, conversationId, length: content.length } })

    if (BrowserWindow.getAllWindows().length === 0) {
      logger.warn({ text: '无窗口可展示确认卡，直接判否', data: { requestId } })
      await this.submitResult(requestId, { ok: true, data: { approved: false } })
      return
    }

    sendMainNotification('*', NotificationModule.MCP_CONFIRM, NotificationMcpConfirmCommand.REQUEST_CONFIRM, {
      requestId,
      conversationId,
      title: String(args.title || '以你的名义发送'),
      content,
      confirmText: String(args.confirmText || '发送'),
      cancelText: String(args.cancelText || '取消'),
      tone: args.tone === 'danger' ? 'danger' : 'default',
      expiresAt: Date.now() + CONFIRM_TTL_MS,
    })
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
