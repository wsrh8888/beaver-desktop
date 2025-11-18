import BMF from 'browser-md5-file'

// 图片尺寸类型
interface ImageSize {
  width: number
  height: number
}

// 音频信息类型
interface AudioInfo {
  duration: number
  // 未来可以扩展：bitrate, channels, sampleRate 等
}

// 视频信息类型
interface VideoInfo {
  width: number
  height: number
  duration: number
  // 未来可以扩展：bitrate, fps, codec 等
}

// 文件信息类型
interface FileInfo {
  type: string
  // 根据文件类型返回对应的详细信息
  imageFile?: ImageSize
  audioFile?: AudioInfo
  videoFile?: VideoInfo
}

/**
 * @description: 获取文件的md5
 * @param {File} file
 * @return {Promise<string>}
 */
export const getMd5 = (file: File): Promise<string> => {
  const bmf = new BMF()
  return new Promise((resolve, reject) => {
    bmf.md5(file, (err: Error, md5: string) => {
      if (err) {
        return reject(err)
      }
      resolve(md5)
    })
  })
}

/**
 * @description: 获取图片的宽度和高度
 * @param {File} file
 * @return {Promise<ImageSize>}
 */
export const getImageAttribute = (file: File): Promise<ImageSize> => {
  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.onload = function (e: ProgressEvent<FileReader>) {
      let result = e.target?.result
      let img: HTMLImageElement = document.createElement('img')
      img.src = result as string
      img.onload = function () {
        resolve({
          width: img.width,
          height: img.height,
        })
      }
    }
    reader.onerror = function (_e: any) {
      resolve({ width: 0, height: 0 })
    }
    reader.readAsDataURL(file)
  })
}

/**
 * @description: 获取音频文件的详细信息
 * @param {File} file
 * @return {Promise<AudioInfo>}
 */
export const getAudioInfo = (file: File): Promise<AudioInfo> => {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      resolve({
        duration: Math.round(audio.duration),
        // 未来可以扩展更多音频属性
      })
      URL.revokeObjectURL(url)
    })

    audio.addEventListener('error', () => {
      resolve({ duration: 0 })
      URL.revokeObjectURL(url)
    })

    audio.src = url
  })
}

/**
 * @description: 获取视频文件的详细信息
 * @param {File} file
 * @return {Promise<VideoInfo>}
 */
export const getVideoInfo = (file: File): Promise<VideoInfo> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.addEventListener('loadedmetadata', () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
        // 未来可以扩展更多视频属性
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

/**
 * @description: 从视频文件生成封面图（第一帧）
 * @param {File} file 视频文件
 * @param {number} time 截取时间点（秒），默认0（第一帧）
 * @return {Promise<string>} 返回base64格式的图片数据URL
 */
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
      // 设置canvas尺寸为视频尺寸
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // 跳转到指定时间点
      video.currentTime = time
    })

    video.addEventListener('seeked', () => {
      try {
        // 将当前帧绘制到canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        // 转换为base64图片
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

/**
 * @description: 获取文件的完整信息（根据类型返回对应信息）
 * @param {File} file
 * @return {Promise<FileInfo>}
 */
export const getFileInfo = async (file: File): Promise<FileInfo> => {
  const fileType = getFileType(file.type)

  switch (fileType) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return { type: fileType, imageFile: imageInfo }
    }

    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return { type: fileType, audioFile: audioInfo }
    }

    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return { type: fileType, videoFile: videoInfo }
    }

    default:
      return { type: fileType }
  }
}

/**
 * @description: 判断当前文件的类型
 * @param {string} mimeType
 * @return {string}
 */
export const getFileType = (mimeType: string): string => {
  if (mimeType.includes('audio')) {
    return 'audio'
  }
  else if (mimeType.includes('image')) {
    return 'image'
  }
  else if (mimeType.includes('video')) {
    return 'video'
  }
  else {
    return 'other'
  }
}

// 导出类型
export type { AudioInfo, FileInfo, ImageSize, VideoInfo }
