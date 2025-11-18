import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 创建目录
 */
export async function createDir(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
  }
  catch {
    // 目录已存在或其他错误，忽略
  }
}

/**
 * 检查目录是否存在
 */
export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(dirPath)
    return stat.isDirectory()
  }
  catch {
    return false
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath)
    return stat.isFile()
  }
  catch {
    return false
  }
}

/**
 * 写入文件
 */
export async function writeFileToPath(filePath: string, data: Buffer | string): Promise<void> {
  await createDir(path.dirname(filePath))
  await fs.promises.writeFile(filePath, data as any)
}

/**
 * 删除文件
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (await fileExists(filePath)) {
      await fs.promises.unlink(filePath)
      return true
    }
    return false
  }
  catch {
    return false
  }
}

/**
 * 获取文件大小
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stat = await fs.promises.stat(filePath)
    return stat.size
  }
  catch {
    return 0
  }
}

/**
 * 计算文件MD5
 */
export async function calculateFileMD5(filePath: string): Promise<string> {
  try {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        hash.update(chunk as any)
      })

      stream.on('end', () => {
        resolve(hash.digest('hex'))
      })

      stream.on('error', (err) => {
        reject(err)
      })
    })
  }
  catch (error) {
    throw new Error(`Failed to calculate MD5 for file ${filePath}: ${(error as Error).message}`)
  }
}
