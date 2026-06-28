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
