import type { IFileRes, IFileUploadResult } from 'commonModule/type/ajax/file'
import { baseUrl } from 'commonModule/config'
import Message from 'renderModule/components/ui/message'
import { getFileInfo } from 'renderModule/utils/file/index'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 预览文件
 */
export const previewOnlineFileApi = (fileKey: string) => {
  return `${baseUrl}/api/file/preview/${fileKey}`
}

/**
 * @description: 文件上传总入口
 */
export const uploadFileApi = async (file: File, fileKey?: string): Promise<IFileUploadResult> => {
  //  if(source === 'local') {
  // return await uploadToLocalApi(file, fileKey)
  // } else if(source === 'qiniu') {
  return await uploadQiniuApi(file, fileKey);
  // }
  //  return Promise.reject(new Error('Invalid source'));
}

/**
 * @description: 通用文件上传函数
 */
const uploadFileApiWithTarget = async (file: File, fileKey?: string, target: 'local' | 'qiniu' = 'local'): Promise<IFileUploadResult> => {
  // 根据目标选择URL
  const baseEndpoint = target === 'qiniu' ? 'uploadQiniu' : 'uploadLocal'
  let uploadUrl = `${baseUrl}/api/file/${baseEndpoint}`

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
    return Promise.reject(new Error(result.message))
  }

  return {
    fileKey: result.result.fileKey,
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
