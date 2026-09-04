/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import axios from 'axios'
import extract from 'extract-zip'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('FileDownload')

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
    logger.info({ text: '解压完成', data: { zipPath, extractTo } })
  }
  catch (err) {
    logger.error({ text: '解压失败', data: { zipPath, extractTo, error: (err as Error)?.message } })
  }
}
