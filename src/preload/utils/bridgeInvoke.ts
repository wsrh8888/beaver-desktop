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

import type { IBeaverBridgeResult } from 'commonModule/type/preload/bridge'
import { BridgeCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

class BridgeInvokeManager {
  /**
   * 内嵌页 JSBridge 统一调用主进程
   * 通过 BridgeCommand.INVOKE 转发 method / params
   * @param method - 能力方法名，形如 app.getEnv
   * @param params - 方法参数
   */
  invoke<T = unknown>(
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<IBeaverBridgeResult<T>> {
    return ipcRenderManager.invoke<IBeaverBridgeResult<T>>(
      IEvent.RenderToMainSyncMsg,
      BridgeCommand.INVOKE,
      { method, params },
    )
  }
}

export default new BridgeInvokeManager()
