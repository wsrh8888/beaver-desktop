import crypto from 'node:crypto'

/**
 * 计算MD5
 */
export function calculateMD5(data: string): string {
  const hash = crypto.createHash('md5')
  hash.update(data)
  return hash.digest('hex')
}

/**
 * 计算SHA256
 */
export function calculateSHA256(data: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(data)
  return hash.digest('hex')
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length)
}
