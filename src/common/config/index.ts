import type { IConfig, IConfigs } from '../type/config'

const config: IConfigs = {
  dev: {
    baseUrl: 'http://127.0.0.1:20800',
    openAppId: 'app_2db39e38',
  },
  test: {
    baseUrl: 'https://server-test.wsrh8888.com/beaver',
    openAppId: 'app_2db39e38',
  },
  prod: {
    baseUrl: 'https://server.wsrh8888.com/beaver',
    openAppId: 'app_2db39e38',
  },
}

// 获取当前配置
function getCurrentConfig(): IConfig {
  // 主进程：从环境变量获取
  if (typeof process !== 'undefined' && process.custom?.ENV) {
    const targetEnv = process.custom.ENV || 'test'
    return config[targetEnv] || config.test
  }

  // 渲染进程：从 window.electron.app.env 获取
  if (typeof window !== 'undefined' && window.electron?.app?.env) {
    return config[electron.app.env]
  }

  // 兜底：返回测试环境配置
  return config.test
}

// 解构配置
const {
  baseUrl,
  openAppId,
} = getCurrentConfig()
export const getBaseUrl = () => getCurrentConfig().baseUrl
export const getOpenAppId = () => getCurrentConfig().openAppId

export {
  baseUrl,
  openAppId,
  getCurrentConfig,
}
