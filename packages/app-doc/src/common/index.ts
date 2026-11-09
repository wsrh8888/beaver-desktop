/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-doc/common — 在线文档领域契约（仅本能力包）
 *
 * 对外只走本入口。平台类型用 @beaver-im/beaver。
 */
export * from './type/ajax/doc'

/** 文档协同 WS 路径（doc_sync_ws 已并入 doc_api，网关按 /api/doc/ 段名路由；WS 升级同入口）。 */
export const DOC_SYNC_WS_PATH = '/api/doc/v1/ws'

/** TipTap 协同共享的 Yjs 文本类型名（须与服务端 deriveContent 读取的一致：'prosemirror'）。 */
export const DOC_YTEXT_NAME = 'prosemirror'
