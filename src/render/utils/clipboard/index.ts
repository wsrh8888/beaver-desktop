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

/**
 * @description: 从 ClipboardEvent 中获取所有文件
 * @param e ClipboardEvent 粘贴事件对象
 * @returns File[] 文件数组
 */
export const getFilesFromClipboardEvent = (e: ClipboardEvent): File[] => {
  const clipboardData = e.clipboardData
  if (!clipboardData)
    return []

  const items = Array.from(clipboardData.items)
  const files: File[] = []

  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  return files
}

/**
 * @description: 从 ClipboardEvent 中获取图片文件
 * @param e ClipboardEvent 粘贴事件对象
 * @returns File[] 图片文件数组
 */
export const getImagesFromClipboardEvent = (e: ClipboardEvent): File[] => {
  return getFilesFromClipboardEvent(e).filter(file => file.type.startsWith('image/'))
}

/**
 * @description: 使用 Clipboard API 主动读取剪贴板中的图片
 * @returns Promise<File | null>
 */
export const getImageFromClipboard = (): Promise<File | null> => {
  return new Promise((resolve) => {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      resolve(null)
      return
    }

    navigator.clipboard.read().then((clipboardItems) => {
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            clipboardItem.getType(type).then((blob) => {
              const file = new File([blob], `clipboard-${Date.now()}.${type.split('/')[1]}`, { type })
              resolve(file)
            }).catch(() => {
              resolve(null)
            })
            return
          }
        }
      }
      resolve(null)
    }).catch(() => {
      resolve(null)
    })
  })
}

/**
 * @description: 使用 Clipboard API 主动读取剪贴板中的所有文件
 * @returns Promise<File[]>
 */
export const getFilesFromClipboard = (): Promise<File[]> => {
  return new Promise((resolve) => {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      resolve([])
      return
    }

    navigator.clipboard.read().then((clipboardItems) => {
      const files: File[] = []
      const promises: Promise<void>[] = []

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')) {
            const promise = clipboardItem.getType(type).then((blob) => {
              const file = new File([blob], `clipboard-${Date.now()}.${type.split('/')[1]}`, { type })
              files.push(file)
            }).catch(() => {
              // 忽略错误
            })
            promises.push(promise)
            break // 每个 clipboardItem 只取第一个匹配的类型
          }
        }
      }

      Promise.all(promises).then(() => {
        resolve(files)
      }).catch(() => {
        resolve([])
      })
    }).catch(() => {
      resolve([])
    })
  })
}
