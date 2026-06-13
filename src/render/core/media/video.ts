import { CacheType } from 'commonModule/type/cache/cache'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'

/**
 * @description: 聊天视频播放（独立播放器窗口）
 */
export class VideoPlayer {
  static async resolveUrl(mediaUrl: string) {
    if (!mediaUrl)
      return ''

    let videoUrl = mediaUrl
    try {
      const cachedUrl = await electron.cache.get(CacheType.USER_VIDEO, mediaUrl)
      if (cachedUrl)
        videoUrl = cachedUrl
    }
    catch {
      // 缓存获取失败，使用在线 URL
    }
    return videoUrl
  }

  static async open(mediaUrl: string, title?: string) {
    if (!mediaUrl)
      return

    const videoUrl = await this.resolveUrl(mediaUrl)
    await electron.window.openWindow('video', {
      unique: true,
      params: {
        url: videoUrl,
        title: title || getFileNameFromUrl(mediaUrl),
      },
    })
  }
}
