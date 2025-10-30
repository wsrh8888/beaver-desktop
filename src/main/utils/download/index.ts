/**
 * @description: 公共下载工具
 * 提供通用的下载、MD5校验等功能
 */

import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import head from 'commonModule/utils/request/head'

/**
 * 下载文件到指定目录
 */
export async function downloadFile(
  url: string,
  targetDir: string,
  fileName: string,
  onProgress: (progress: number) => void,
): Promise<string> {
  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const filePath = path.join(targetDir, fileName)

  // 先使用HEAD请求探测资源信息
  const headResponse = await head({
    method: 'HEAD',
    url,
  })

  // 检查HEAD请求是否成功
  if ('status' in headResponse && headResponse.status === 200) {
    const totalBytes = Number.parseInt((headResponse as any).headers['content-length'] || '0', 10)
    let downloadedBytes = 0

    // 使用GET请求下载文件
    const response = await head({
      method: 'GET',
      url,
      responseType: 'stream',
    })

    // 检查GET请求是否成功
    if ('status' in response && response.status === 200) {
      const file = fs.createWriteStream(filePath);

      (response as any).data.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length
        const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0
        onProgress(progress)
      });

      (response as any).data.pipe(file)

      return new Promise<string>((resolve, reject) => {
        file.on('finish', () => {
          file.close()
          onProgress(100)
          resolve(filePath)
        })

        file.on('error', (err) => {
          fs.unlink(filePath, () => {}) // 删除不完整的文件
          reject(err)
        })
      })
    }
    else {
      throw new Error('GET请求失败')
    }
  }
  else {
    throw new Error('HEAD请求失败，无法获取资源信息')
  }
}

/**
 * 计算文件MD5
 */
export async function calculateFileMd5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)

    stream.on('data', (data) => {
      hash.update(data)
    })

    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })

    stream.on('error', reject)
  })
}
