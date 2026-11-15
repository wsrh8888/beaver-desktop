/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IDocPresence } from '@packageCommon/type/ajax/doc'
import { DOC_ROOM_SEP, DOC_SYNC_WS_PATH } from '@packageCommon'
import { getDocSyncStateApi, checkPermissionApi } from '@packageRender/api/doc'
import { getBaseUrl } from '@beaver-im/beaver/renderer'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

/**
 * 文档协同链路：HTTP 权威快照 → Y.Doc(本地 IndexedDB 离线态) → y-websocket 增量 →
 * doc_api 网关(docId@epoch 房间) → doc_rpc 权威存储。
 *
 * 三个关键约束：
 * 1. 房间名必须是 docId@epoch，epoch 一律由服务端下发；版本回滚后旧房间会被拒绝。
 * 2. 根类型是 Y.XmlFragment('prosemirror')（TipTap Collaboration 的真实行为），不是 YText。
 * 3. 离线编辑不丢：每次 Y.Doc 更新都全量落 IndexedDB；重连后 y-websocket 按 state vector
 *    自动把离线期间的 CRDT 变更补发给服务端，无需额外的"待发送队列"。
 */

export type DocSyncStatus =
  | 'connecting'
  | 'connected'
  | 'synced'
  | 'disconnected'
  | 'reconnecting'
  | 'offline'
  | 'epochChanged'
  | 'error'

export interface IDocProviderOptions {
  docId: string
  userId: string
  userName: string
  /** 外部强制只读（如分享链接 viewer）。 */
  readOnly?: boolean
  /** 已知纪元；不传时从 HTTP /doc/syncState 拉取服务端权威值。 */
  epoch?: number
  onStatus?: (status: DocSyncStatus, detail?: unknown) => void
  onPresence?: (list: IDocPresence[]) => void
  /** 待同步的本地变更计数变化（离线期间递增，sync 后归零）。 */
  onPending?: (count: number) => void
  /** 检测到服务端纪元变化：调用方必须销毁编辑器与 provider 后重建。 */
  onEpochChange?: (epoch: number) => void
  onError?: (error: unknown) => void
}

export interface IDocProviderHandle {
  ydoc: Y.Doc
  provider: WebsocketProvider
  room: string
  epoch: number
  version: number
  readOnly: boolean
  /** 服务端/本地是否已有 CRDT 状态；false 时编辑器需要用 contentJson 播种。 */
  hasServerState: boolean
  status: DocSyncStatus
  /** 未同步的本地变更计数（离线期间递增，sync 后归零）。 */
  pendingCount: number
  destroy: () => void
  /** 异常断线时核对服务端纪元；返回 false 表示已变化并触发 onEpochChange。 */
  checkEpoch: () => Promise<boolean>
  /** 立即把当前 CRDT 全量状态写入 IndexedDB。 */
  flush: () => Promise<void>
  setReadOnly: (value: boolean) => void
}

// ==================== 常量 / 工具 ====================

const PALETTE = ['#e5484d', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++)
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** 把 http(s) 基址换成 ws(s)，拼上 doc_api 的 WS 入口。 */
function buildWsUrl(): string {
  const http = getBaseUrl().replace(/\/+$/, '')
  return http.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:') + DOC_SYNC_WS_PATH
}

interface IElectronBridge {
  storage?: { getAsync?: (k: string) => Promise<{ token?: string, userId?: string, name?: string }> }
  app?: { devicedId?: string, env?: string }
}

function electronBridge(): IElectronBridge | undefined {
  return ((globalThis as any).electron || (globalThis as any).window?.electron) as IElectronBridge | undefined
}

async function readAuth(): Promise<{ token: string, userId: string, deviceId: string }> {
  try {
    const bridge = electronBridge()
    const info = await bridge?.storage?.getAsync?.('userInfo')
    return {
      token: info?.token || '',
      userId: info?.userId || '',
      deviceId: bridge?.app?.devicedId || '',
    }
  }
  catch {
    return { token: '', userId: '', deviceId: '' }
  }
}

/** base64 → Uint8Array（Go 的 []byte 经 JSON 序列化为 base64 字符串）。 */
function fromBase64(value?: string): Uint8Array {
  if (!value)
    return new Uint8Array()
  try {
    const bin = atob(value)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++)
      out[i] = bin.charCodeAt(i)
    return out
  }
  catch {
    return new Uint8Array()
  }
}

const ROLE_RANK: Record<string, number> = {
  owner: 5,
  manager: 4,
  editor: 3,
  commenter: 2,
  viewer: 1,
}
const rank = (role?: string) => ROLE_RANK[role || ''] || 0

// ==================== IndexedDB 离线持久化 ====================

const DB_NAME = 'beaver-doc-offline'
const DB_STORE = 'ydoc-state'
const DB_VERSION = 1

function openOfflineDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined')
    return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(DB_STORE))
          db.createObjectStore(DB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    }
    catch {
      resolve(null)
    }
  })
}

function idbGet(key: string): Promise<Uint8Array | null> {
  return openOfflineDB().then(db => new Promise((resolve) => {
    if (!db)
      return resolve(null)
    try {
      const tx = db.transaction(DB_STORE, 'readonly')
      const req = tx.objectStore(DB_STORE).get(key)
      req.onsuccess = () => {
        const value = req.result
        if (value instanceof Uint8Array)
          resolve(value)
        else if (value instanceof ArrayBuffer)
          resolve(new Uint8Array(value))
        else
          resolve(null)
        db.close()
      }
      req.onerror = () => {
        db.close()
        resolve(null)
      }
    }
    catch {
      db.close()
      resolve(null)
    }
  }))
}

function idbPut(key: string, value: Uint8Array): Promise<void> {
  return openOfflineDB().then(db => new Promise((resolve) => {
    if (!db)
      return resolve()
    try {
      const tx = db.transaction(DB_STORE, 'readwrite')
      tx.objectStore(DB_STORE).put(value, key)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    }
    catch {
      db.close()
      resolve()
    }
  }))
}

function idbDelete(key: string): Promise<void> {
  return openOfflineDB().then(db => new Promise((resolve) => {
    if (!db)
      return resolve()
    try {
      const tx = db.transaction(DB_STORE, 'readwrite')
      tx.objectStore(DB_STORE).delete(key)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    }
    catch {
      db.close()
      resolve()
    }
  }))
}

// ==================== presence ====================

/** 从 awareness 状态抽取在线用户 presence 列表（含光标位置）。 */
export function readPresence(awareness?: any): IDocPresence[] {
  if (!awareness)
    return []
  const out: IDocPresence[] = []
  awareness.getStates().forEach((state: any, clientId: number) => {
    const u = state?.user
    if (u && typeof u.name === 'string') {
      out.push({
        clientId,
        userId: String(u.id || ''),
        name: u.name,
        color: u.color || '#888',
        cursor: state?.cursor || undefined,
        readOnly: !!u.readOnly,
      })
    }
  })
  return out
}

// ==================== provider ====================

/**
 * 为一个 docId 建立完整协同会话。返回的 handle 由编辑器持有，卸载时必须 destroy()。
 * 调用方应在 onEpochChange 中销毁编辑器并重建（新 epoch 的 CRDT 状态与旧房间完全隔离）。
 */
export async function createDocProvider(options: IDocProviderOptions): Promise<IDocProviderHandle> {
  const { docId, onStatus, onPresence, onPending, onEpochChange, onError } = options
  if (!docId)
    throw new Error('createDocProvider: docId 不能为空')

  const emitStatus = (status: DocSyncStatus, detail?: unknown) => {
    handle.status = status
    onStatus?.(status, detail)
  }
  const fail = (error: unknown) => {
    onError?.(error)
    emitStatus('error', error)
  }

  // 1) 服务端权威纪元 + 快照 + 增量（HTTP 全量入口）
  const stateRes = await getDocSyncStateApi({ docId, epoch: options.epoch })
  if (stateRes.code !== 0 || !stateRes.result)
    throw new Error(stateRes.msg || '获取文档同步状态失败')
  const syncState = stateRes.result
  const epoch = syncState.epoch > 0 ? syncState.epoch : 1
  const room = `${docId}${DOC_ROOM_SEP}${epoch}`
  const offlineKey = `doc:${room}`

  // 2) 有效权限 → 只读态（服务端 Authorize 也会独立判定，这里是客户端即时反馈）
  let readOnly = !!options.readOnly
  try {
    const perm = await checkPermissionApi({ resourceType: 'doc', resourceId: docId })
    if (perm.code === 0 && perm.result)
      readOnly = readOnly || rank(perm.result.role) < rank('editor')
  }
  catch (error) {
    // 权限接口不可达时不阻塞建连，交给服务端 Authorize 兜底。
    fail(error)
  }

  // 3) Y.Doc：先恢复本地离线态，再叠加服务端权威状态（CRDT 合流，天然幂等）
  const ydoc = new Y.Doc()
  const localState = await idbGet(offlineKey)
  if (localState && localState.length)
    Y.applyUpdate(ydoc, localState, 'offline')
  const snapshot = fromBase64(syncState.snapshot)
  if (snapshot.length)
    Y.applyUpdate(ydoc, snapshot, 'http-snapshot')
  for (const raw of syncState.updates || []) {
    const update = fromBase64(raw)
    if (update.length)
      Y.applyUpdate(ydoc, update, 'http-update')
  }

  // 4) 鉴权参数（userId 必须与 JWT claims 一致；epoch/room 供服务端校验）
  const auth = await readAuth()
  const userId = options.userId || auth.userId
  const params: Record<string, string> = {
    docId,
    userId,
    token: auth.token,
    platform: 'beaver-desktop',
    epoch: String(epoch),
    room,
  }
  if (auth.deviceId)
    params.deviceId = auth.deviceId

  const provider = new WebsocketProvider(buildWsUrl(), room, ydoc, {
    params,
    connect: true,
    resyncInterval: 5000,
    maxBackoffTime: 15000,
  })
  provider.awareness?.setLocalStateField('user', {
    id: userId,
    name: options.userName || '协作者',
    color: colorFor(userId || options.userName || docId),
  })

  let destroyed = false
  let epochNotified = false
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let pendingCount = 0

  const handle: IDocProviderHandle = {
    ydoc,
    provider,
    room,
    epoch,
    version: syncState.version || 0,
    readOnly,
    hasServerState: snapshot.length > 0
      || (syncState.updates || []).some(u => !!u)
      || (localState?.length || 0) > 0,
    status: 'connecting',
    pendingCount: 0,
    destroy: () => {},
    checkEpoch: async () => true,
    flush: async () => {},
    setReadOnly: () => {},
  }

  /** 全量落盘：用 encodeStateAsUpdate 而非累积 update，崩溃恢复只需一条记录。 */
  const persist = async () => {
    if (destroyed)
      return
    try {
      await idbPut(offlineKey, Y.encodeStateAsUpdate(ydoc))
    }
    catch (error) {
      fail(error)
    }
  }
  const schedulePersist = () => {
    if (saveTimer)
      clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = undefined
      void persist()
    }, 400)
  }

  const onDocUpdate = (_update: Uint8Array, origin: any) => {
    if (destroyed)
      return
    // 离线/未同步期间产生的变更计数，用于 UI 展示"待同步"。
    if (handle.status !== 'synced' && origin !== 'http-snapshot' && origin !== 'offline') {
      pendingCount += 1
      handle.pendingCount = pendingCount
      onPending?.(pendingCount)
    }
    schedulePersist()
  }
  ydoc.on('update', onDocUpdate)

  const emitPresence = () => onPresence?.(readPresence(provider.awareness))
  provider.awareness?.on('change', emitPresence)
  if (onPresence)
    emitPresence()

  provider.on('status', ({ status }: { status: string }) => {
    if (destroyed)
      return
    if (status === 'connected')
      emitStatus('connected')
    else if (status === 'disconnected')
      emitStatus('disconnected')
  })

  provider.on('sync', (isSynced: boolean) => {
    if (destroyed)
      return
    if (isSynced) {
      pendingCount = 0
      handle.pendingCount = 0
      onPending?.(0)
      emitStatus('synced')
      void persist()
    }
    else {
      emitStatus('connecting')
    }
  })

  provider.on('connection-error', (event: unknown) => {
    if (destroyed)
      return
    emitStatus('offline', event)
  })

  /** 异常断线核对纪元：HTTP 409 在浏览器 WebSocket 上只表现为 1006，无法直接读状态码。 */
  const checkEpoch = async (): Promise<boolean> => {
    if (destroyed || epochNotified)
      return false
    try {
      const res = await getDocSyncStateApi({ docId, epoch })
      const current = res.result?.epoch || 0
      if (current > 0 && current !== epoch) {
        epochNotified = true
        emitStatus('epochChanged', { from: epoch, to: current })
        // 旧纪元离线态不再可用，避免重建后被重新加载。
        void idbDelete(offlineKey)
        provider.disconnect()
        onEpochChange?.(current)
        return false
      }
      return true
    }
    catch (error) {
      fail(error)
      return true
    }
  }

  provider.on('connection-close', (event: unknown) => {
    if (destroyed)
      return
    const closeEvent = event as { code?: number } | null
    if (closeEvent?.code === 1000)
      return // 主动关闭
    emitStatus('reconnecting', event)
    void checkEpoch().then((same) => {
      if (same && !destroyed && provider.shouldConnect && !provider.wsconnected)
        provider.connect()
    })
  })

  handle.checkEpoch = checkEpoch
  handle.flush = persist
  handle.setReadOnly = (value: boolean) => {
    handle.readOnly = value
    readOnly = value
    // awareness 广播只读态，其他客户端可在协作者列表上标注。
    provider.awareness?.setLocalStateField('user', {
      id: userId,
      name: options.userName || '协作者',
      color: colorFor(userId || options.userName || docId),
      readOnly: value,
    })
  }
  handle.destroy = () => {
    if (destroyed)
      return
    destroyed = true
    if (saveTimer)
      clearTimeout(saveTimer)
    void persist()
    ydoc.off('update', onDocUpdate)
    provider.awareness?.off('change', emitPresence)
    try {
      provider.destroy()
    }
    catch { /* noop */ }
    try {
      ydoc.destroy()
    }
    catch { /* noop */ }
  }

  // 初次落盘，保证冷启动即有本地快照。
  await persist()
  return handle
}

export { Y }
