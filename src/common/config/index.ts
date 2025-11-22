import type { IConfig, IConfigs } from '../type/config'

const config: IConfigs = {
  dev: {
    baseUrl: 'http://127.0.0.1:20800',
    wsUrl: 'http://127.0.0.1:20800/api/ws/ws',
  },
  test: {
    baseUrl: 'https://server-test.wsrh8888.com/beaver',
    wsUrl: 'https://serverr-test.wsrh8888.com/beaver/api/ws/ws',
  },
  prod: {
    baseUrl: 'https://server.wsrh8888.com/beaver',
    wsUrl: 'https://server.wsrh8888.com/beaver/api/ws/ws',
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
  wsUrl,
} = getCurrentConfig()
export const getBaseUrl = () => getCurrentConfig().baseUrl

export {
  baseUrl,
  getCurrentConfig,
  wsUrl,
}
