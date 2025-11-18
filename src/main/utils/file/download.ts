import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import axios from 'axios'
import extract from 'extract-zip'

export interface DownloadedFileInfo {
  path: string
  size: number
  md5: string
}

export const downloadFile = async (url: string, outputPath: string): Promise<DownloadedFileInfo> => {
  try {
    const writer = fs.createWriteStream(outputPath)
    const hash = crypto.createHash('md5')
    let fileSize = 0

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    response.data.pipe(writer)

    // 同时计算 MD5 和文件大小
    response.data.on('data', (chunk: Buffer) => {
      hash.update(chunk as any)
      fileSize += chunk.length
    })

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const calculatedMd5 = hash.digest('hex')
        resolve({
          path: outputPath,
          size: fileSize,
          md5: calculatedMd5,
        })
      })
      writer.on('error', (err) => {
        // 如果写入流发生错误，则关闭并删除文件
        writer.close()
        fs.unlink(outputPath, () => reject(err))
      })
    })
  }
  catch (error) {
    // 捕获请求过程中的任何错误，并确保不会留下不完整的文件
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }
    throw error
  }
}

export const extractZip = async (
  zipPath: string,
  extractTo: string,
): Promise<void> => {
  try {
    await extract(zipPath, { dir: extractTo })
    console.log(`Extraction complete to ${extractTo}`)
  }
  catch (err) {
    console.error('Error during extraction:', err)
  }
}
