/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'

/**
 * 在线文档插件 activate。
 * 文档域无需主进程常驻业务（协同走渲染进程直连 doc_sync_ws，权威读写走 doc_api HTTP），
 * 此处保留空激活钩子以对齐能力包规范。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  // no-op
}
