/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
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
