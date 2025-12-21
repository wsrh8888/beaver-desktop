import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import moment from 'moment'
import { v4 as uuidV4 } from 'uuid'
import Logger from '../logger'

const logger = new Logger('ajax')
export interface IResponseSuccessData<T> {
  code: number
  msg: string
  result: T
}

export interface headerRequest {
  [key: string]: string | number
}

// 简单的内存缓存
let cachedToken = ''

// 异步加载token（如果还没有加载过）
const ensureTokenLoaded = async (): Promise<void> => {
  if (cachedToken)
    return // 如果已有缓存，直接返回

  try {
    const userInfo = await electron.storage.getAsync('userInfo')
    cachedToken = userInfo?.token || ''
  }
  catch (error) {
    console.warn('获取token失败:', error)
  }
}

// 基础请求配置
const baseRequest = axios.create({
  baseURL: '',
  url: '',
  data: {},
  timeout: 50000, // 请求超时时间,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  params: {},
})

// 请求拦截器
baseRequest.interceptors.request.use(
  async (config) => {
    // 如果没有缓存的token，尝试异步获取
    if (!cachedToken) {
      await ensureTokenLoaded()
    }

    // 根据进程类型获取不同的headers
    config.headers = {
      source: 'beaver-desktop',
      timestamp: `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
      env: electron.app.env,
      deviceId: electron.app.devicedId,
      version: electron.app.version,
      token: cachedToken,
      ...(config.headers || {}),
    } as any

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
baseRequest.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * 通用AJAX请求函数
 * @param config 请求配置
 * @returns Promise
 */
function ajax<T>(config: AxiosRequestConfig): Promise<IResponseSuccessData<T>> {
  const httpId = uuidV4()
  const currentTime = new Date().getTime()

  // 添加UUID到headers
  config.headers = {
    ...(config.headers || {}),
    uuid: httpId,
  }

  return baseRequest(config)
    .then((response) => {
      const spendTime = new Date().getTime() - currentTime
      let _response = response as unknown as IResponseSuccessData<T>

      if (_response.code === 0) {
        logger.info({
          text: 'ajax接口正常',
          analyse: '[ajax]接口正常',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          response: JSON.stringify(response),
          config: JSON.stringify(config),
        })
      }
      else {
        logger.error({
          text: 'ajax状态码异常',
          analyse: '[ajax]状态码异常',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          response: JSON.stringify(response),
          config: JSON.stringify(config),
        })
      }

      return _response
    })
    .catch((err: AxiosError) => {
      const spendTime = new Date().getTime() - currentTime
      logger.error({
        text: 'ajax接口异常',
        analyse: '[ajax]接口异常',
        spendTime: `${spendTime}ms`,
        uuid: httpId,
        response: JSON.stringify({
          code: err?.code,
          message: err.message,
        }),
        config: JSON.stringify(config),
      })
      return {
        code: -1,
        msg: err.message,
      }
    }) as Promise<IResponseSuccessData<T>>
}

export default ajax
