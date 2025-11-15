/**
 * @description: 公共下载工具
 * 提供通用的下载、MD5校验等功能
 */

import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import head from 'commonModule/utils/request/head'

export interface DownloadedFileInfo {
  path: string
  size: number
  md5: string
}

/**
 * 下载文件到指定路径
 */
export async function downloadFile(
  url: string,
  filePath: string,
  onProgress?: (progress: number) => void,
): Promise<DownloadedFileInfo> {
  // 确保目标目录存在
  const targetDir = path.dirname(filePath)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // 直接使用GET请求下载文件
  const response = await head({
    method: 'GET',
    url,
    responseType: 'stream',
  })

  // 检查GET请求是否成功
  if ('status' in response && response.status === 200) {
    const totalBytes = Number.parseInt((response as any).headers['content-length'] || '0', 10)
    let downloadedBytes = 0
    const hash = crypto.createHash('md5')

    const file = fs.createWriteStream(filePath);

    (response as any).data.on('data', (chunk: Buffer) => {
      hash.update(chunk)
      downloadedBytes += chunk.length
      const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0
      onProgress?.(progress)
    });

    (response as any).data.pipe(file)

    return new Promise<DownloadedFileInfo>((resolve, reject) => {
      file.on('finish', () => {
        file.close()
        onProgress?.(100)
        const calculatedMd5 = hash.digest('hex')
        resolve({
          path: filePath,
          size: downloadedBytes,
          md5: calculatedMd5,
        })
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
