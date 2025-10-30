/**
 * 验证缓存键格式
 */
export function validateCacheKey(key: string, type: string): boolean {
  if (!key || typeof key !== 'string') {
    return false
  }

  switch (type) {
    case 'chat_messages':
      return key.includes('_') // 格式: user_123_user_456
    case 'avatar':
      return /^[\w.-]+$/.test(key) // 格式: 文件名（支持扩展名）
    case 'sticker':
      return key.includes(':') // 格式: category:stickerId
    case 'moment':
      return key.includes(':') // 格式: userId:date
    case 'update_package':
      return /^\d+\.\d+\.\d+$/.test(key) // 格式: 1.0.0
    default:
      return true
  }
}

/**
 * 验证版本号格式
 */
export function validateVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version)
}

/**
 * 验证用户ID格式
 */
export function validateUserId(userId: string): boolean {
  return /^\w+$/.test(userId)
}

/**
 * 验证文件名格式
 */
export function validateFileName(fileName: string): boolean {
  // 支持常见的文件名格式：字母、数字、下划线、点、连字符
  return /^[\w.-]+$/.test(fileName) && fileName.length > 0 && fileName.length < 255
}
