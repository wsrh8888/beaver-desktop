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

import type { IConfig, IConfigs } from '../type/config'

const config: IConfigs = {
  dev: {
    baseUrl: 'http://127.0.0.1:20800',
    openAppId: 'app_2db39e38',
    env: 'dev',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
  test: {
    baseUrl: 'https://server-test.wsrh8888.com/beaver',
    openAppId: 'app_2db39e38',
    env: 'test',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
  prod: {
    baseUrl: 'https://server.wsrh8888.com/beaver',
    openAppId: 'app_2db39e38',
    env: 'prod',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
}

function getCurrentConfig(): IConfig {
  if (typeof process !== 'undefined' && process.custom?.ENV) {
    const targetEnv = process.custom.ENV || 'test'
    return config[targetEnv] || config.test
  }

  if (typeof window !== 'undefined' && window.electron?.app?.env) {
    return config[electron.app.env]
  }

  return config.test
}

const {
  baseUrl,
  openAppId,
  logId,
} = getCurrentConfig()

export const getBaseUrl = () => getCurrentConfig().baseUrl
export const getOpenAppId = () => getCurrentConfig().openAppId
export const getLogId = () => getCurrentConfig().logId

export {
  baseUrl,
  openAppId,
  logId,
  getCurrentConfig,
}
