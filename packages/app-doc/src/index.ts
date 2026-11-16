/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-doc 在线文档 app
 *
 * 主进程走 @beaver-im/beaver/main；渲染进程走 @beaver-im/beaver/renderer + beaver-ui。
 * 领域类型在 common/type/ajax/doc；ajax 在 renderer/api/doc。
 * 协同：TipTap(ProseMirror) + Yjs(Y.XmlFragment) + y-websocket provider 连 /beaver-doc/api/doc/ws/v1/connect。
 * 房间名由服务端按 docId@epoch 权威生成；版本回滚递增 epoch，客户端须重建 provider。
 */
export {}
