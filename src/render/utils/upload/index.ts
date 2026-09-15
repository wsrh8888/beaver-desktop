/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 宿主兼容层：实现已迁到 @beaver-im/beaver/renderer */
export {
  uploadFile,
  selectAndUploadFile,
  uploadFileFromBase64,
} from '@beaver-im/beaver/renderer'
export type {
  UploadResult,
  UploadFileType,
  UploadStyle,
} from '@beaver-im/beaver/renderer'
