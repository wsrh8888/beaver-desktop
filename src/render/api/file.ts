import { baseUrl } from "commonModule/config"

/**
 * @description: 预览文件
 */
export const previewOnlineFileApi = (fileId: string) => {
  return `${baseUrl}/api/file/preview/${fileId}`
}
