import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

// 直接导入logger
let logger: any

// 简单的进程检测
if (typeof window !== 'undefined' && window.electron) {
  // 渲染进程
  import('renderModule/utils/log').then((LoggerModule) => {
    logger = new LoggerModule.default('head')
  })
}
else {
  // 主进程
  import('mainModule/utils/log').then((mainLogger) => {
    logger = mainLogger.default
  })
}

// 探测接口专用请求实例
const baseRequest = axios.create({
  baseURL: '',
  timeout: 5000,
})

baseRequest.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
    } as any
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

baseRequest.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * @description 静态资源专用请求
 * @description 探测使用 HEAD 请求
 * @description METHOD: GET | HEAD | POST
 * @description 返回值需要自己捕获异常，但是不要加日志
 */
function head(config: AxiosRequestConfig): Promise<AxiosResponse | AxiosError> {
  const httpId = uuidV4()
  config.headers = {
    ...(config.headers || {}),
    uuid: httpId,
  }
  const currentTime = new Date().getTime()

  return baseRequest(config)
    .then((response) => {
      const spendTime = new Date().getTime() - currentTime
      if (logger) {
        logger.info({
          text: 'head请求成功',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          url: config.url,
          method: config.method,
          config: JSON.stringify(config),
        }, 'head')
      }

      return Promise.resolve(response)
    })
    .catch((err: AxiosError) => {
      const spendTime = new Date().getTime() - currentTime
      if (logger) {
        logger.error({
          text: 'head请求失败',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          url: config.url,
          method: config.method,
          config: JSON.stringify(config),
          response: JSON.stringify({
            code: err?.code,
            message: err?.message,
          }),
        }, 'head')
      }
      return Promise.reject(err)
    })
}

export default head
