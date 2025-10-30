import { getBaseUrl } from 'commonModule/config'

/**
 * @description: 预览文件
 */
export const previewOnlineFileApi = (fileName: string) => {
  return `${getBaseUrl()}/api/file/preview/${fileName}`
}
