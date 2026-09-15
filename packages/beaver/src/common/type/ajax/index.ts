/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 插件可见的请求配置（对齐 AxiosRequestConfig 常用字段，不直接依赖 axios） */
export interface IAjaxRequestConfig {
  method?: string
  url?: string
  data?: any
  headers?: Record<string, any>
  params?: any
  timeout?: number
  [key: string]: any
}

/** 插件可见的统一响应 */
export interface IAjaxResponse<T = any> {
  code: number
  msg: string
  result?: T
}

export type AjaxFn = <T = any>(config: IAjaxRequestConfig) => Promise<IAjaxResponse<T>>
