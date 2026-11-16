/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IConfig, IConfigs } from '../type/config'

/**
 * 环境配置。
 *
 * baseUrl 只是网关 origin（协议 + 域名 + 端口），不含任何路径段：
 * 具体接口路径写在每个 url 里（`/beaver/api/...`、`/beaver-social/api/...` 等）。
 * 网关按路径第 2 段做 team 分流，所以 team 必须由调用方自己带，不能塞进 base。
 */
const config: IConfigs = {
  dev: {
    baseUrl: 'http://127.0.0.1:20800',
    oauthId: 'oauth_2db39e38',
    env: 'dev',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
  test: {
    baseUrl: 'https://server-test.wsrh8888.com',
    oauthId: 'oauth_2db39e38',
    env: 'test',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
  prod: {
    baseUrl: 'https://server.wsrh8888.com',
    oauthId: 'oauth_2db39e38',
    env: 'prod',
    logId: 'b2c3d4e5-f6a7-4789-b012-456789abcdef',
  },
}

function getElectron(): any {
  return (globalThis as any).electron || (globalThis as any).window?.electron
}

function getCurrentConfig(): IConfig {
  // 主进程：process.custom；渲染进程：electron.app
  if (typeof process !== 'undefined' && (process as any).custom?.ENV) {
    const custom = (process as any).custom
    let current = config[custom.ENV] || config.test
    if (custom.BASE_URL) {
      current = { ...current, baseUrl: custom.BASE_URL }
    }
    return current
  }

  const app = getElectron()?.app
  if (app?.env) {
    let current = config[app.env] || config.test
    if (app.baseUrl) {
      current = { ...current, baseUrl: app.baseUrl }
    }
    return current
  }

  return config.test
}

const {
  baseUrl,
  oauthId,
  logId,
} = getCurrentConfig()

export const getBaseUrl = () => getCurrentConfig().baseUrl
export const getLogId = () => getCurrentConfig().logId

export {
  baseUrl,
  oauthId,
  logId,
  getCurrentConfig,
}
