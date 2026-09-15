/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import Logger from '../logger'

const logger = new Logger('file-utils')

interface ImageSize {
  width: number
  height: number
}

interface AudioInfo {
  duration: number
}

interface VideoInfo {
  width: number
  height: number
  duration: number
}

interface FileInfo {
  type: string
  imageFile?: ImageSize
  audioFile?: AudioInfo
  videoFile?: VideoInfo
}

export function getFileNameFromUrl(fileUrl: string): string {
  if (!fileUrl)
    return ''
  try {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const name = new URL(fileUrl).pathname.split('/').pop()
      return name || fileUrl
    }
  }
  catch {
    logger.error({ text: 'getFileNameFromUrl 失败' })
  }
  return fileUrl.split(/[/\\]/).pop() || fileUrl
}

export const getImageAttribute = (file: File): Promise<ImageSize> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = document.createElement('img')
      img.src = e.target?.result as string
      img.onload = () => resolve({ width: img.width, height: img.height })
    }
    reader.onerror = () => resolve({ width: 0, height: 0 })
    reader.readAsDataURL(file)
  })
}

export const getAudioInfo = (file: File): Promise<AudioInfo> => {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.addEventListener('loadedmetadata', () => {
      resolve({ duration: Math.round(audio.duration) })
      URL.revokeObjectURL(url)
    })
    audio.addEventListener('error', () => {
      resolve({ duration: 0 })
      URL.revokeObjectURL(url)
    })
    audio.src = url
  })
}

export const getVideoInfo = (file: File): Promise<VideoInfo> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    video.addEventListener('loadedmetadata', () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
      })
      URL.revokeObjectURL(url)
    })
    video.addEventListener('error', () => {
      resolve({ width: 0, height: 0, duration: 0 })
      URL.revokeObjectURL(url)
    })
    video.src = url
  })
}

export const getVideoThumbnail = (file: File, time: number = 0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const url = URL.createObjectURL(file)

    if (!ctx) {
      URL.revokeObjectURL(url)
      reject(new Error('无法创建canvas上下文'))
      return
    }

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = time
    })

    video.addEventListener('seeked', () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        URL.revokeObjectURL(url)
        resolve(thumbnail)
      }
      catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    })

    video.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('视频加载失败'))
    })

    video.src = url
    video.load()
  })
}

export const getFileType = (mimeType: string): string => {
  if (mimeType.includes('audio'))
    return 'audio'
  if (mimeType.includes('image'))
    return 'image'
  if (mimeType.includes('video'))
    return 'video'
  return 'other'
}

export const getFileInfo = async (file: File): Promise<FileInfo> => {
  const fileType = getFileType(file.type)
  switch (fileType) {
    case 'image':
      return { type: fileType, imageFile: await getImageAttribute(file) }
    case 'audio':
      return { type: fileType, audioFile: await getAudioInfo(file) }
    case 'video':
      return { type: fileType, videoFile: await getVideoInfo(file) }
    default:
      return { type: fileType }
  }
}

export type { AudioInfo, FileInfo, ImageSize, VideoInfo }
