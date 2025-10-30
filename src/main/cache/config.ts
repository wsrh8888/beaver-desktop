import { CacheType } from 'commonModule/type/cache/cache'

export const cacheConfig = {
  logs: {},
  update: {},
  users: {
    '[userId]': {
      db: {},
      cache: {
        images: {},
        videos: {},
        voices: {},
        avatars: {},
      },
      logs: {},
    },
  },
}

/**
 * 文件类型映射配置
 * 根据文件扩展名自动识别应该放到哪个缓存目录
 */
export const fileTypeMapping: Record<string, string> = {
  // 图片类型
  '.jpg': 'images',
  '.jpeg': 'images',
  '.png': 'images',
  '.gif': 'images',
  '.bmp': 'images',
  '.webp': 'images',

  // 视频类型
  '.mp4': 'videos',
  '.avi': 'videos',
  '.mov': 'videos',
  '.wmv': 'videos',
  '.flv': 'videos',
  '.mkv': 'videos',

  // 语音类型
  '.mp3': 'voices',
  '.wav': 'voices',
  '.aac': 'voices',
  '.ogg': 'voices',
  '.wma': 'voices',
  '.m4a': 'voices',
}

export const cacheTypeToFilePath: Record<CacheType, string> = {
  [CacheType.USER_AVATAR]: '/users/[userId]/cache/avatars',
  [CacheType.USER_DB]: '/users/[userId]/db',
}
