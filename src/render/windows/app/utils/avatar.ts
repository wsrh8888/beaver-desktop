/**
 * @description: 处理头像路径，数据库存储完整 URL
 */
export function processAvatarUrl(avatar: string): string {
  return avatar?.trim() || ''
}

/**
 * @description: 批量处理对象中的头像字段
 */
export function processObjectAvatar<T extends Record<string, any>>(
  obj: T,
  avatarField: string = 'avatar',
): T {
  if (!obj || !obj[avatarField])
    return obj

  return {
    ...obj,
    [avatarField]: processAvatarUrl(obj[avatarField]),
  }
}

/**
 * @description: 批量处理数组中对象的头像字段
 */
export function processArrayAvatars<T extends Record<string, any>>(
  array: T[],
  avatarField: string = 'avatar',
): T[] {
  return array?.map(item => processObjectAvatar(item, avatarField))
}

/**
 * @description: 处理消息发送者的头像
 */
export function processSenderAvatar(sender: any): any {
  if (!sender)
    return sender

  return {
    ...sender,
    avatar: processAvatarUrl(sender.avatar),
  }
}
