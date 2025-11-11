import { uploadFileApi } from 'renderModule/api/file'
import { getAudioInfo, getFileType, getImageAttribute, getVideoInfo } from 'renderModule/utils/file/index'

// 上传文件类型
export type UploadFileType = 'image' | 'video' | 'audio' | 'file'

// 上传结果的基础结构
export interface UploadResult {
  fileKey: string
  style: UploadStyle
  type: UploadFileType
  originalName?: string
  size?: number
}

// 不同类型文件的样式信息
export interface UploadStyle {
  // 图片和视频共有
  width?: number
  height?: number
  // 视频和音频共有
  duration?: number
}

/**
 * @description: 统一的文件上传方法
 * @param file 要上传的文件
 * @returns Promise<UploadResult>
 */
export const uploadFile = async (file: File): Promise<UploadResult> => {
  // 自动检测文件类型
  const detectedType = getFileType(file.type)
  const fileType: UploadFileType = detectedType === 'other' ? 'file' : detectedType as UploadFileType

  // 先上传文件
  const uploadResult = await uploadFileApi(file, file.name)

  // 根据类型获取样式信息
  const style = await getFileStyle(file, fileType)

  return {
    fileKey: uploadResult.fileName,
    style,
    type: fileType,
    originalName: uploadResult.originalName,
    size: file.size,
  }
}

/**
 * @description: 根据文件类型获取样式信息
 */
const getFileStyle = async (file: File, type: UploadFileType): Promise<UploadStyle> => {
  switch (type) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return {
        width: imageInfo.width,
        height: imageInfo.height,
      }
    }

    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return {
        width: videoInfo.width,
        height: videoInfo.height,
        duration: videoInfo.duration,
      }
    }

    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return {
        duration: audioInfo.duration,
      }
    }

    case 'file':
    default:
      return {}
  }
}

/**
 * @description: 选择文件（统一入口）
 * @param accept 接受的文件类型，例如 'image/*', 'video/*', 'audio/*'，不传则允许所有文件
 * @param multiple 是否支持多选，默认 false
 * @returns Promise<File[]>
 */
export const selectFile = (accept?: string, multiple: boolean = false): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    if (accept) {
      input.accept = accept
    }

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        resolve(Array.from(target.files))
      }
      else {
        resolve([])
      }
    }

    input.oncancel = () => {
      resolve([])
    }

    input.click()
  })
}

/**
 * @description: 选择并上传文件（统一入口，支持多选）
 * @param accept 接受的文件类型，例如 'image/*', 'video/*', 'audio/*'，不传则允许所有文件
 * @param multiple 是否支持多选，默认 false
 * @returns Promise<UploadResult[]> 返回上传结果数组
 */
export const selectAndUploadFile = async (accept?: string, multiple: boolean = false): Promise<UploadResult[]> => {
  const files = await selectFile(accept, multiple)
  if (files.length === 0) {
    return []
  }

  // 并发上传所有文件
  const uploadPromises = files.map(file => uploadFile(file))
  return Promise.all(uploadPromises)
}
