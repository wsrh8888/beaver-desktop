type config = {
  baseUrl: string
  wsUrl: string
}
interface configs {
  [key: string]: config
}
const config: configs = {
  test: {
    baseUrl: 'http://127.0.0.1:8888',
    wsUrl: "ws://127.0.0.1:8888/api/ws/ws"

  },
  prod: {
    baseUrl: 'http://127.0.0.1:8888',
    wsUrl: "ws://127.0.0.1:8888/api/ws/ws"
   },
}

function getEnvConfig(): config {
  // 检查是否在 Electron 环境中
  if (typeof window !== 'undefined' && window.electron && window.electron.app && window.electron.app.env === 'test') {
    return config.test;
  }
  
  // 检查是否在 miniApp 环境中
  if (typeof window !== 'undefined' && (window as any).miniApp && (window as any).miniApp.env === 'test') {
    return config.test;
  }
  
  return config.prod;
}




export const {
  baseUrl,
  wsUrl,
} = getEnvConfig()