/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { AjaxFn, IAjaxRequestConfig, IAjaxResponse } from '@packageCommon/type/ajax'
import { getMainRuntime } from '../../bind'

/** 主进程 ajax 门面（实现由宿主 bind，能力包禁止 import mainModule/utils/request） */
export function ajax<T = any>(config: IAjaxRequestConfig): Promise<IAjaxResponse<T>> {
  return getMainRuntime().request.ajax<T>(config)
}

export type { AjaxFn, IAjaxRequestConfig, IAjaxResponse }
