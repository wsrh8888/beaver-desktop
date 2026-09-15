/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { uploadFileApi } from '../../api/file'
import Logger from '../logger'
import {
  getAudioInfo,
  getFileNameFromUrl,
  getFileType,
  getImageAttribute,
  getVideoInfo,
  getVideoThumbnail,
} from '../file'

const logger = new Logger('UploadUtils')

export type UploadFileType = 'image' | 'video' | 'audio' | 'file'

export interface UploadStyle {
  width?: number
  height?: number
  duration?: number
}

export interface UploadResult {
  fileUrl: string
  style: UploadStyle
  type: UploadFileType
  originalName?: string
  size?: number
  thumbnailUrl?: string
}

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--)
    u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

const getFileStyle = async (file: File, type: UploadFileType): Promise<UploadStyle> => {
  switch (type) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return { width: imageInfo.width, height: imageInfo.height }
    }
    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return { width: videoInfo.width, height: videoInfo.height, duration: videoInfo.duration }
    }
    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return { duration: audioInfo.duration }
    }
    default:
      return {}
  }
}

const selectFile = (accept?: string, multiple: boolean = false): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    if (accept)
      input.accept = accept

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      resolve(target.files?.length ? Array.from(target.files) : [])
    }
    input.oncancel = () => resolve([])
    input.click()
  })
}

export const selectAndUploadFile = async (accept?: string, multiple: boolean = false): Promise<UploadResult[]> => {
  const files = await selectFile(accept, multiple)
  if (!files.length)
    return []
  return Promise.all(files.map(file => uploadFile(file)))
}

export const uploadFile = async (file: File): Promise<UploadResult> => {
  const detectedType = getFileType(file.type)
  const fileType: UploadFileType = detectedType === 'other' ? 'file' : detectedType as UploadFileType

  const uploadResult = await uploadFileApi(file, file.name)
  const fileUrl = uploadResult.fileUrl
  if (!fileUrl)
    throw new Error('上传响应缺少 fileUrl')

  const style = await getFileStyle(file, fileType)
  let thumbnailUrl: string | undefined

  if (fileType === 'video') {
    try {
      const thumbnailBase64 = await getVideoThumbnail(file, 0)
      const baseName = getFileNameFromUrl(fileUrl).replace(/\.[^.]+$/, '') || `video_${Date.now()}`
      const thumbnailFile = base64ToFile(thumbnailBase64, `${baseName}_thumb.jpg`)
      const thumbnailUploadResult = await uploadFileApi(thumbnailFile, `${baseName}_thumb.jpg`)
      thumbnailUrl = thumbnailUploadResult.fileUrl
    }
    catch (error) {
      logger.error({ text: '生成视频封面失败', data: { error: (error as Error)?.message } })
    }
  }

  return {
    fileUrl,
    style,
    type: fileType,
    originalName: uploadResult.originalName,
    size: file.size,
    thumbnailUrl,
  }
}

export const uploadFileFromBase64 = async (base64: string, filename?: string): Promise<UploadResult> => {
  const name = filename || `screenshot-${Date.now()}.png`
  const file = base64ToFile(`data:image/png;base64,${base64}`, name)
  return uploadFile(file)
}
