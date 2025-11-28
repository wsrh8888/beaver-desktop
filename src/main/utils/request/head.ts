import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import Logger from 'mainModule/utils/logger/index'

import { v4 as uuidV4 } from 'uuid'

const logger = new Logger('head')

// 探测接口专用请求实例
const baseRequest = axios.create({
  baseURL: '',
  timeout: 5000,
})

// 配置重试机制
axiosRetry(baseRequest, {
  retries: 1, // 重试1次，总共2次请求
  retryDelay: () => {
    return 1000 // 固定延迟：1秒
  },
  retryCondition: (error: AxiosError) => {
    // HTTP状态码不为200且不是404时重试
    const shouldRetry = !error.response || (error.response.status !== 200 && error.response.status !== 404)
    return shouldRetry
  },
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
      logger.info({
        text: 'head请求成功',
        spendTime: `${spendTime}ms`,
        uuid: httpId,
        config: JSON.stringify(config),
      })

      return Promise.resolve(response)
    })
    .catch((err: AxiosError) => {
      const spendTime = new Date().getTime() - currentTime
      logger.error({
        text: 'head请求失败',
        spendTime: `${spendTime}ms`,
        uuid: httpId,
        config: JSON.stringify(config),
        response: JSON.stringify({
          code: err?.code,
          message: err?.message,
        }),
      })
      return Promise.reject(err)
    })
}

export default head
