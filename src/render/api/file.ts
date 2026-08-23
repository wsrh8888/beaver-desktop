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

import type { IFileRes, IFileUploadResult } from 'commonModule/type/ajax/file'
import { baseUrl } from 'commonModule/config'
import Message from 'renderModule/components/ui/message'
import { getFileInfo } from 'renderModule/utils/file/index'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 文件上传总入口
 */
export const uploadFileApi = async (file: File, fileKey?: string): Promise<IFileUploadResult> => {
  //  if(source === 'local') {
  return await uploadToLocalApi(file, fileKey)
  // } else if(source === 'qiniu') {
  // return await uploadQiniuApi(file, fileKey);
  // }
  //  return Promise.reject(new Error('Invalid source'));
}

/**
 * @description: 通用文件上传函数
 */
const uploadFileApiWithTarget = async (file: File, fileKey?: string, target: 'local' | 'qiniu' = 'local'): Promise<IFileUploadResult> => {
  // 根据目标选择URL
  const uploadPath = target === 'qiniu' ? '/api/file/v1/uploadQiniu' : '/api/file/v1/uploadLocal'
  let uploadUrl = `${baseUrl}${uploadPath}`

  if (fileKey) {
    uploadUrl += `?fileKey=${encodeURIComponent(fileKey)}`
  }

  // 获取文件信息
  const fileInfo = await getFileInfo(file)

  // 创建FormData - 将fileInfo作为FormData字段
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileInfo', JSON.stringify(fileInfo))

  const result = await ajax<IFileRes>({
    method: 'POST',
    data: formData,
    url: uploadUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (result.code !== 0) {
    Message.error(result.msg)
    return Promise.reject(new Error(result.msg))
  }

  const fileUrl = result.result.fileUrl
  if (!fileUrl) {
    return Promise.reject(new Error('上传响应缺少 fileUrl'))
  }

  return {
    fileUrl,
    originalName: result.result.originalName,
    fileInfo,
  }
}

/**
 * @description: 上传文件到本地
 */
const uploadToLocalApi = (file: File, fileKey?: string) => uploadFileApiWithTarget(file, fileKey, 'local')

/**
 * @description: 上传文件到七牛云
 */
const uploadQiniuApi = (file: File, fileKey?: string) => uploadFileApiWithTarget(file, fileKey, 'qiniu')
