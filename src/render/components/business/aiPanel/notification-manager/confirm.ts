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

/**
 * 待确认动作：agent 要动手（代发消息、删文件…）时下发的请求，以及用户表态后的回传。
 *
 * 入队只带数据，不回传；回传在 resolveConfirm 里做，且只有送达才出队 ——
 * 显示「已确认」但服务端没收到，比让用户再点一次糟糕得多。
 */
import { submitAgentToolResultApi } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'
import { useAiPanelStore } from '../store'

const logger = new Logger('AiPanelConfirm')

/** 服务端下发的确认请求（MCP_CONFIRM / REQUEST_CONFIRM） */
export function handleConfirmRequest(data: any): void {
  const requestId = String(data?.requestId || '')
  const refId = String(data?.conversationId || '')
  if (!requestId || !refId) {
    logger.warn({ text: '确认请求缺少字段', data: { requestId, refId } })
    return
  }

  useAiPanelStore().pushConfirm(refId, {
    requestId,
    title: String(data?.title || '需要你确认'),
    content: String(data?.content || ''),
    confirmText: String(data?.confirmText || '确认'),
    cancelText: String(data?.cancelText || '取消'),
    tone: data?.tone === 'danger' ? 'danger' : 'default',
    expiresAt: Number(data?.expiresAt) || Date.now() + 120_000,
  })
  logger.info({ text: '收到确认请求', data: { refId, requestId } })
}

/** 服务端主动撤回（超时、断线） */
export function handleConfirmCancel(data: any): void {
  const requestId = String(data?.requestId || '')
  const refId = String(data?.conversationId || '')
  if (!requestId || !refId)
    return
  useAiPanelStore().dropConfirm(refId, requestId)
  logger.info({ text: '服务端撤回确认请求', data: { refId, requestId } })
}

/**
 * 用户表态：只有 approved=true 才让服务端真发。
 * @returns 是否送达；false 时卡片会留在原地让用户重试
 */
export async function resolveConfirm(refId: string, requestId: string, approved: boolean): Promise<boolean> {
  try {
    const res = await submitAgentToolResultApi({ requestId, ok: true, data: { approved } })
    if (res.code !== 0) {
      logger.error({ text: '确认结果未送达', data: { refId, requestId, approved } })
      return false
    }
    useAiPanelStore().dropConfirm(refId, requestId)
    logger.info({ text: '确认结果已回传', data: { refId, requestId, approved } })
    return true
  }
  catch (err) {
    logger.error({ text: '确认结果回传失败', data: { refId, requestId, error: (err as Error).message } })
    return false
  }
}
