import type { IFileRes, IFileUploadResult } from 'commonModule/type/ajax/file'
import { baseUrl } from 'commonModule/config'
import { getFileInfo } from 'renderModule/utils/file/index'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 预览文件
 */
export const previewOnlineFileApi = (fileName: string) => {
  return `${baseUrl}/api/file/preview/${fileName}`
}

/**
 * @description: 文件上传总入口
 */
export const uploadFileApi = async (file: File, fileName?: string): Promise<IFileUploadResult> => {
  //  if(source === 'local') {
  return await uploadToLocalApi(file, fileName)
  // } else if(source === 'qiniu') {
  // return await uploadQiniuApi(file, fileName);
  // }
  //  return Promise.reject(new Error('Invalid source'));
}

/**
 * @description: 通用文件上传函数
 */
export const uploadFileApiWithTarget = async (file: File, fileName?: string, target: 'local' | 'qiniu' = 'local'): Promise<IFileUploadResult> => {
  // 根据目标选择URL
  const baseEndpoint = target === 'qiniu' ? 'uploadQiniu' : 'uploadLocal'
  let uploadUrl = `${baseUrl}/api/file/${baseEndpoint}`

  if (fileName) {
    uploadUrl += `?fileName=${encodeURIComponent(fileName)}`
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

  return {
    fileName: result.result.fileName,
    originalName: result.result.originalName,
    fileInfo,
  }
}

/**
 * @description: 上传文件到本地
 */
export const uploadToLocalApi = (file: File, fileName?: string) => uploadFileApiWithTarget(file, fileName, 'local')

/**
 * @description: 上传文件到七牛云
 */
export const uploadQiniuApi = (file: File, fileName?: string) => uploadFileApiWithTarget(file, fileName, 'qiniu')
