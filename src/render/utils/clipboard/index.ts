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
