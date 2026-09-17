/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { IAjaxRequestConfig, IAjaxResponse, AjaxFn } from '@packageCommon/type/ajax'
import axios from 'axios'
import moment from 'moment'
import { v4 as uuidV4 } from 'uuid'
import Logger from '../logger'

const logger = new Logger('ajax')

function getElectron(): any {
  return (globalThis as any).electron || (globalThis as any).window?.electron
}

let cachedToken = ''

const ensureTokenLoaded = async (): Promise<void> => {
  if (cachedToken)
    return
  try {
    const userInfo = await getElectron()?.storage?.getAsync?.('userInfo')
    cachedToken = userInfo?.token || ''
  }
  catch (error) {
    logger.warn({ text: '获取token失败', data: { error: (error as Error)?.message } })
  }
}

const baseRequest = axios.create({
  baseURL: '',
  url: '',
  data: {},
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  params: {},
})

baseRequest.interceptors.request.use(
  async (config) => {
    if (!cachedToken)
      await ensureTokenLoaded()

    const app = getElectron()?.app
    config.headers = {
      source: 'beaver-desktop',
      timestamp: `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
      env: app?.env,
      deviceId: app?.devicedId,
      version: app?.version,
      token: cachedToken,
      ...(config.headers || {}),
    } as any

    return config
  },
  error => Promise.reject(error),
)

baseRequest.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error),
)

/** 渲染进程 ajax（直接依赖 electron.storage / electron.app） */
export function ajax<T = any>(config: IAjaxRequestConfig): Promise<IAjaxResponse<T>> {
  const httpId = uuidV4()
  const currentTime = Date.now()
  const axiosConfig = config as AxiosRequestConfig

  axiosConfig.headers = {
    ...(axiosConfig.headers || {}),
    uuid: httpId,
  }

  return baseRequest(axiosConfig)
    .then((response) => {
      const spendTime = Date.now() - currentTime
      const _response = response as unknown as IAjaxResponse<T>

      if (_response.code === 0) {
        logger.info({
          text: 'ajax接口正常',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          response: JSON.stringify(response),
          config: JSON.stringify(config),
        })
      }
      else {
        logger.error({
          text: 'ajax状态码异常',
          spendTime: `${spendTime}ms`,
          uuid: httpId,
          response: JSON.stringify(response),
          config: JSON.stringify(config),
        })
      }

      return _response
    })
    .catch((err: AxiosError) => {
      const spendTime = Date.now() - currentTime
      logger.error({
        text: 'ajax接口异常',
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
    }) as Promise<IAjaxResponse<T>>
}

export default ajax
export type { AjaxFn, IAjaxRequestConfig, IAjaxResponse }
