/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 宿主兼容层：实现已迁到 @beaver-im/beaver/renderer */
export { ajax as default, ajax } from '@beaver-im/beaver/renderer'
export type { IAjaxRequestConfig as AxiosRequestConfig } from '@beaver-im/beaver/renderer'
