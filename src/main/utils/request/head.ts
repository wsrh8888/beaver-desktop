/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import Logger from 'mainModule/utils/logger/index'

import { v4 as uuidV4 } from 'uuid'

const logger = new Logger('head')

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
