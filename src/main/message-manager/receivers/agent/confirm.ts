/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 工具确认管理器（agent 交互层）。requiresConfirm 工具被调时：
 *   1. receivers/agent/index.ts 不直接执行，发确认通知给 AI 渲染进程
 *   2. AI 渲染进程渲染卡片，用户确认/编辑参数后经 IPC 回传
 *   3. 主进程 confirmTool 拿到确认参数，resolve 挂起的 Promise，续跑执行
 *
 * 这是 UI 交互层的事，跟 mcp 协议无关：mcp router 只管路由执行，确认卡片由本模块管。
 * 服务端零改动：它只看到 agent 事件挂起等回传，客户端在执行前多一步用户确认。
 */
import { NotificationMcpConfirmCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('agent-confirm')

interface PendingConfirm {
  confirmId: string
  server: string
  tool: string
  args: Record<string, any>
  resolve: (confirmedArgs: Record<string, any> | null) => void
  timer: NodeJS.Timeout
}

const pending = new Map<string, PendingConfirm>()

const CONFIRM_TIMEOUT_MS = 5 * 60 * 1000 // 5 分钟，用户可能慢慢编辑

/**
 * 发起一次工具确认。通过 sendMainNotification 把卡片数据发到 AI 渲染进程，
 * 挂起等用户确认。返回用户确认后的参数（可能被编辑过）；用户取消返回 null。
 */
export function requestConfirm(
  server: string,
  tool: string,
  description: string,
  args: Record<string, any>,
  schema: Record<string, any> | null,
): Promise<Record<string, any> | null> {
  const confirmId = `cfm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (pending.delete(confirmId)) {
        logger.warn({ text: '工具确认超时', data: { confirmId, server, tool } })
        // 取消通知（让渲染进程关卡片）
        sendMainNotification('ai', NotificationModule.MCP_CONFIRM, NotificationMcpConfirmCommand.CANCEL_CONFIRM, { confirmId })
        resolve(null)
      }
    }, CONFIRM_TIMEOUT_MS)

    pending.set(confirmId, { confirmId, server, tool, args, resolve, timer })
    sendMainNotification('ai', NotificationModule.MCP_CONFIRM, NotificationMcpConfirmCommand.REQUEST_CONFIRM, {
      confirmId,
      server,
      tool,
      description,
      args,
      schema,
    })
    logger.info({ text: '已请求工具确认', data: { confirmId, server, tool } })
  })
}

/**
 * 渲染进程回传确认结果。confirmed=true 带（可能编辑过的）参数续跑；
 * confirmed=false 用户取消，返回 null 终止执行。
 */
export function confirmTool(confirmId: string, confirmed: boolean, args?: Record<string, any>): boolean {
  const item = pending.get(confirmId)
  if (!item)
    return false
  pending.delete(confirmId)
  clearTimeout(item.timer)
  logger.info({ text: '收到工具确认', data: { confirmId, confirmed, server: item.server, tool: item.tool } })
  item.resolve(confirmed ? (args || item.args) : null)
  return true
}
