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

/** 文档协同 WS 路径（网关按 /api/doc/ 段名路由；WS 升级与 HTTP 同入口）。 */
export const DOC_SYNC_WS_PATH = '/api/doc/v1/ws'

/**
 * TipTap Collaboration 使用的 Yjs 根类型名。
 * 注意：@tiptap/extension-collaboration 实际调用 ydoc.getXmlFragment(field)，
 * 即根类型是 Y.XmlFragment 而非 YText；服务端 persist.go 按同名 XmlFragment 派生正文。
 */
export const DOC_YTEXT_NAME = 'prosemirror'
/** 语义化别名：与 DOC_YTEXT_NAME 同值，明确表达根类型是 XmlFragment。 */
export const DOC_XML_FRAGMENT_NAME = DOC_YTEXT_NAME

/** 协同房间名分隔符：docId@epoch。不能用 #（会被浏览器当作 URL fragment 截断）。 */
export const DOC_ROOM_SEP = '@'
