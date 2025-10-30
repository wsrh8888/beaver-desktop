import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import { getRootPath } from 'mainModule/config'

// 获取缓存目录路径 - 基于开源IM项目设计
export const getCachePath = (type: CacheType) => {
  const root = path.join(getRootPath(), 'cache')

  // 按日期创建目录：YYYY-MM-DD
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const dateDir = path.join(root, dateStr)

  switch (type) {
    case CacheType.CHAT_MESSAGES:
      return path.join(root, 'chats') // 聊天记录不按日期，按会话
    case CacheType.CHAT_MEDIA:
      return path.join(root, 'chats') // 聊天媒体文件不按日期，按会话
    case CacheType.AVATAR:
      return path.join(root, 'avatars') // 头像全局存储
    case CacheType.STICKER:
      return path.join(root, 'stickers') // 表情包全局存储
    case CacheType.MOMENT:
      return path.join(dateDir, 'moments') // 朋友圈按日期存储
    case CacheType.MOMENT_IMAGE:
      return path.join(dateDir, 'moments') // 朋友圈图片按日期存储
    case CacheType.UPDATE_PACKAGE:
      return path.join(root, 'updates') // 升级包全局存储
    default:
      return root
  }
}

// 获取聊天会话目录路径
export const getChatConversationPath = (conversationId: string) => {
  const chatsDir = getCachePath(CacheType.CHAT_MESSAGES)
  return path.join(chatsDir, conversationId)
}

// 获取表情包分类目录路径
export const getStickerCategoryPath = (category: string) => {
  const stickersDir = getCachePath(CacheType.STICKER)
  return path.join(stickersDir, category)
}

// 获取朋友圈用户目录路径
export const getMomentUserPath = (userId: string, date: string) => {
  const momentsDir = getCachePath(CacheType.MOMENT)
  const dateDir = path.join(momentsDir, date)
  return path.join(dateDir, userId)
}
