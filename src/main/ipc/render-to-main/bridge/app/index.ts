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
import type { IBridgeSession } from 'mainModule/bridge/registry'

class BridgeAppHandler {
  handle(action: string, _params: Record<string, unknown>, _session: IBridgeSession): IBeaverBridgeResult {
    switch (action) {
      case 'getEnv':
        return {
          code: 0,
          msg: 'ok',
          result: {
            env: process.custom?.ENV || 'prod',
            deviceId: process.custom?.DEVICE_ID || '',
          },
        }
      default:
        return { code: 1, msg: `unknown app action: ${action}`, result: null }
    }
  }
}

export default new BridgeAppHandler()
