/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/beaver 渲染进程出口（直接依赖 electron.xxx，无需 bind） */
export { default as Logger } from './utils/logger'
export { ajax } from './utils/request'
export type { AjaxFn, IAjaxRequestConfig, IAjaxResponse } from './utils/request'
export { uploadFile, selectAndUploadFile, uploadFileFromBase64 } from './utils/upload'
export type { UploadResult, UploadFileType, UploadStyle } from './utils/upload'
export { getBaseUrl } from './config'
export { getUserId } from './user'
export { initWindow } from './utils/init/window'
export { uploadFileApi } from './api/file'
