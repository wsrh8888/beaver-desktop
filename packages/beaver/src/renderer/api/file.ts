/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { getBaseUrl } from '../config'
import { ajax } from '../utils/request'
import { getFileInfo } from '../utils/file'
import Logger from '../utils/logger'

const logger = new Logger('file-api')

export interface IFileUploadResult {
  fileUrl: string
  originalName?: string
  fileInfo?: any
}

/** 上传文件到本地存储服务 */
export async function uploadFileApi(file: File, fileKey?: string): Promise<IFileUploadResult> {
  logger.info({ text: 'uploadFileApi 开始' })

  let uploadUrl = `${getBaseUrl()}/api/file/v1/uploadLocal`
  if (fileKey)
    uploadUrl += `?fileKey=${encodeURIComponent(fileKey)}`

  const fileInfo = await getFileInfo(file)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileInfo', JSON.stringify(fileInfo))

  const result = await ajax<{ fileUrl: string, originalName?: string }>({
    method: 'POST',
    data: formData,
    url: uploadUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (result.code !== 0)
    return Promise.reject(new Error(result.msg || '上传失败'))

  const fileUrl = result.result?.fileUrl
  if (!fileUrl)
    return Promise.reject(new Error('上传响应缺少 fileUrl'))

  return {
    fileUrl,
    originalName: result.result?.originalName,
    fileInfo,
  }
}
