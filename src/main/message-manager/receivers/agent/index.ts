/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * AI agent 相关 ws 消息接收器。服务端下发「执行本机工具」事件（AI 决定调一个 host 工具），
 * stream-receiver 识别 event==='host' 后调本模块：解析 payload（含 root）→
 * 需要确认走 confirm → 调 mcp router 执行 → 回传 submitHostResult。
 *
 * root（工作目录）跟会话走：会话绑定工作空间时存服务端，服务端下发 host 事件时在 payload 里带下来，
 * 客户端不维护工作目录映射表。云端会话（无 root）禁止写盘。
 *
 * 全程在主进程完成，不再转发渲染进程，不再经 IPC 往返。
 * 跟 chat/friend/group 等 receiver 同惯例：一种 ws 消息类型一个子目录。
 */
import type { IHostEventPayload } from 'commonModule/type/mcp'
import { submitHostResultApi } from 'mainModule/api/mcp'
import { getMcpManager } from 'mainModule/mcp'
import Logger from 'mainModule/utils/logger'
import { requestConfirm } from './confirm'

const logger = new Logger('agent-receiver')

/**
 * 处理一条 agent host 工具调用并回传结果。
 * @param conversationId 会话 id
 * @param dataJson payload JSON 字符串 { requestId, server, tool, args, root }
 */
export async function handleHostToolCall(conversationId: string, dataJson: string): Promise<void> {
  let payload: IHostEventPayload = {}
  if (dataJson) {
    try {
      payload = JSON.parse(dataJson)
    }
    catch (err: any) {
      logger.warn({ text: 'agent 事件 payload 解析失败', data: { error: err?.message } })
    }
  }
  const requestId = payload.requestId || ''
  if (!requestId)
    return

  const root = payload.root || ''
  logger.info({ text: '收到本机工具', data: { server: payload.server, tool: payload.tool, requestId, conversationId, hasRoot: !!root } })

  let result: { ok: boolean, data?: Record<string, any>, error?: string }
  if (!root) {
    result = { ok: false, error: '当前为云端会话，无本机工作目录。请在「空间」中打开本地文件夹。' }
  }
  else {
    const manager = await getMcpManager()
    // requiresConfirm 工具：先弹卡片让用户确认/编辑参数，确认后再执行。
    // 服务端零改动：agent 事件挂起等回传，客户端在执行前多一步用户确认。
    let execArgs = payload.args || {}
    if (manager.isRequiresConfirm(payload.server || '', payload.tool || '')) {
      const schema = manager.getToolSchema(payload.server || '', payload.tool || '')
      const confirmed = await requestConfirm(
        payload.server || '',
        payload.tool || '',
        manager.getToolDescription(payload.server || '', payload.tool || ''),
        execArgs,
        schema,
      )
      if (confirmed === null) {
        result = { ok: false, error: '用户已取消' }
      }
      else {
        execArgs = confirmed
        result = await manager.callTool(payload.server || '', payload.tool || '', execArgs, root)
      }
    }
    else {
      result = await manager.callTool(payload.server || '', payload.tool || '', execArgs, root)
    }
  }

  try {
    const res = await submitHostResultApi({
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
