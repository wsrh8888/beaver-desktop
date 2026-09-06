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
 * User-Agent 工具类
 * 对标大厂：型号 + 系统版本 + 设备名
 * BeaverDesktop/1.0.0 (windows; x64) device_id/xxx model/Windows-PC os/10.0.19045 name/DESKTOP-HOME
 */

import os from 'node:os'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('index')


function encodeUAToken(value: string): string {
    logger.info({ text: 'encodeUAToken 开始' })
  return encodeURIComponent(value)
}

export function generateUserAgentIdentifier(): string {
    logger.info({ text: 'generateUserAgentIdentifier 开始' })
  const version = process.custom.VERSION
  const deviceId = process.custom.DEVICE_ID
  const platformName = process.custom.PLATFORM
  const arch = process.arch
  const archName = arch === 'arm64' ? 'arm64' : 'x64'
  const osVersion = os.release()
  const name = os.hostname()

  return `BeaverDesktop/${version} (${platformName}; ${archName}) device_id/${deviceId} model/${platformName} os/${osVersion} name/${encodeUAToken(name)}`
}
