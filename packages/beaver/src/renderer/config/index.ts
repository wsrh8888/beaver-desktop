/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 对齐宿主 src/common/config：按 env 取配置，electron.app.baseUrl 可选覆盖 */

type Env = 'prod' | 'test' | 'dev'

const config: Record<Env, { baseUrl: string, env: Env }> = {
  dev: {
    baseUrl: 'http://127.0.0.1:20800',
    env: 'dev',
  },
  test: {
    baseUrl: 'https://server-test.wsrh8888.com/beaver',
    env: 'test',
  },
  prod: {
    baseUrl: 'https://server.wsrh8888.com/beaver',
    env: 'prod',
  },
}

function getElectron(): any {
  return (globalThis as any).electron || (globalThis as any).window?.electron
}

function getCurrentConfig() {
  const app = getElectron()?.app
  if (app?.env) {
    let current = config[app.env as Env] || config.test
    if (app.baseUrl) {
      current = { ...current, baseUrl: app.baseUrl }
    }
    return current
  }
  return config.test
}

export function getBaseUrl(): string {
  return getCurrentConfig().baseUrl
}
