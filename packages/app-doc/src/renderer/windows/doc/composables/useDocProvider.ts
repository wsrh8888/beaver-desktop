/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import { DOC_SYNC_WS_PATH } from '@packageCommon'
import { getBaseUrl } from '@beaver-im/beaver/renderer'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

/**
 * 构建 doc_sync_ws 的 websocket 基址：把 http(s) 基址协议换成 ws(s)。
 * 网关按 /api/<seg>/ 段名路由（doc_sync → doc_sync_api），WS 与 HTTP 同一入口。
 */
function buildWsUrl(): string {
  const http = getBaseUrl().replace(/\/+$/, '')
  return http.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:') + DOC_SYNC_WS_PATH
}

interface IElectronBridge {
  storage?: { getAsync?: (k: string) => Promise<{ token?: string, userId?: string }> }
  app?: { devicedId?: string, env?: string }
}

async function readAuth(): Promise<{ token: string, userId: string }> {
  const bridge = ((globalThis as any).electron || (globalThis as any).window?.electron) as IElectronBridge | undefined
  try {
    const info = await bridge?.storage?.getAsync?.('userInfo')
    return { token: info?.token || '', userId: info?.userId || '' }
  }
  catch {
    return { token: '', userId: '' }
  }
}

/** 稳定的 presence 颜色（按 userId 哈希取色板）。 */
const PALETTE = ['#e5484d', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++)
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/**
 * useDocProvider：为一个 docId 建立 Y.Doc + y-websocket provider（连 doc_sync_ws）。
 * - 房间名 = docId；docId/token/platform 作为 query 透传（网关 JWT 读 token，logic 读 docId）。
 * - awareness 承载 presence（用户名/颜色/在线）。
 * 返回的 ydoc 交由 TipTap Collaboration 扩展绑定（字段名 'prosemirror'，与服务端一致）。
 */
export async function createDocProvider(docId: string, userName: string, userId: string) {
  const ydoc = new Y.Doc()
  const { token } = await readAuth()
  const params: Record<string, string> = { docId }
  if (token)
    params.token = token
  params.platform = 'beaver-desktop'

  const provider = new WebsocketProvider(buildWsUrl(), docId, ydoc, {
    params,
    connect: true,
  })

  provider.awareness?.setLocalStateField('user', { name: userName, id: userId, color: colorFor(userId || userName) })

  return { ydoc, provider }
}

/** 从 awareness 状态抽取在线用户 presence 列表。 */
export function readPresence(awareness?: any): IDocPresence[] {
  if (!awareness)
    return []
  const out: IDocPresence[] = []
  awareness.getStates().forEach((state: any, clientId: number) => {
    const u = state?.user
    if (u && typeof u.name === 'string')
      out.push({ clientId, name: u.name, color: u.color || '#888' })
  })
  return out
}

export { Y }
