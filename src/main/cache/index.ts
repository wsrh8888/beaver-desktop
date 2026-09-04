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

/**
 * 媒体缓存服务
 * 简洁高效的文件缓存管理
 */

import type { CacheType } from 'commonModule/type/cache/cache'
import { getCacheLocalFileName, moveDownloadToCache } from 'mainModule/utils/file'
import * as path from 'node:path'
import { getCachePath } from 'mainModule/config'
import { downloadFile } from 'mainModule/utils/file/download'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('MediaManager')
import dBServicemediaCache from '../database/services/media/media'
import { createDir, deleteFile, fileExists, getFileSize } from '../utils/file'
import { cacheConfig, cacheTypeToFilePath, getDateFolder } from './config'

export interface CacheEntry {
  hash: string
  path: string
  type: string
  size?: number
  createdAt: number
  updatedAt: number
  isDeleted: number
}

/**
 * 媒体缓存服务 - 专注于核心缓存操作
 */
class MediaManager {
  private cacheRoot: string
  private userId?: string
  private downloadingFiles: Set<string> = new Set()
  private cacheFile: Record<string, string> = {}

  constructor() {
    this.cacheRoot = getCachePath()
  }

  init(userId?: string) {
    this.userId = userId
    logger.info({ text: '媒体缓存服务初始化', data: { hasUserId: Boolean(userId) } })
    this.processConfigAndCreateDirs(cacheConfig, this.cacheRoot, userId)
  }

  private async processConfigAndCreateDirs(config: any, currentPath: string, userId?: string): Promise<void> {
    for (const [key, value] of Object.entries(config)) {
      if (key === '[userId]') {
        if (!userId)
          continue
        const userPath = path.join(currentPath, userId)
        await createDir(userPath)
        await this.processConfigAndCreateDirs(value, userPath, userId)
      }
      else if (typeof value === 'object' && value !== null) {
        const newPath = path.join(currentPath, key)
        await createDir(newPath)
        await this.processConfigAndCreateDirs(value, newPath, userId)
      }
    }
  }

  private resolveCacheDir(type: CacheType): string {
    let filePath = cacheTypeToFilePath[type]
    if (filePath.includes('[userId]')) {
      if (!this.userId) {
        logger.error({ text: '缓存目录解析失败：userId 未设置', data: { type } })
        throw new Error('userId is not set')
      }
      filePath = filePath.replace('[userId]', this.userId)
    }

    return path.join(this.cacheRoot, filePath, getDateFolder())
  }

  private resolveOutputPath(type: CacheType, md5: string, fileUrl: string): string {
    return path.join(this.resolveCacheDir(type), getCacheLocalFileName(md5, fileUrl))
  }

  private createTempPath(type: CacheType): string {
    return path.join(this.resolveCacheDir(type), '.tmp', `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  }

  /**
   * @param fileUrl 完整远程 URL（与 media.url 一致）
   */
  async add(type: CacheType, fileUrl: string): Promise<string | null> {
    if (this.downloadingFiles.has(fileUrl)) {
      return fileUrl
    }

    this.downloadingFiles.add(fileUrl)

    try {
      if (!fileUrl) {
        throw new Error('fileUrl is not set')
      }

      const cacheInfo = await dBServicemediaCache.getMediaInfo({ url: fileUrl })
      if (cacheInfo && await fileExists(cacheInfo.path)) {
        return cacheInfo.path
      }

      const tempPath = this.createTempPath(type)
      await createDir(path.dirname(tempPath))

      const downloadedFile = await downloadFile(fileUrl, tempPath)
      const finalPath = this.resolveOutputPath(type, downloadedFile.md5, fileUrl)
      const savedPath = await moveDownloadToCache(tempPath, finalPath)

      await dBServicemediaCache.upsert({
        url: fileUrl,
        md5: downloadedFile.md5,
        path: savedPath,
        type,
        size: downloadedFile.size,
      })

      return savedPath
    }
    catch (error) {
      logger.error({
        text: '媒体缓存下载失败',
        data: { fileUrl, error: (error as Error)?.message },
      })
      return fileUrl
    }
    finally {
      this.downloadingFiles.delete(fileUrl)
    }
  }

  /**
   * @param fileUrl 完整远程 URL，先查 media 表再决定返回本地路径或远程 URL
   */
  async get(type: CacheType, fileUrl: string): Promise<string> {
    if (this.cacheFile[fileUrl]) {
      return this.cacheFile[fileUrl]
    }

    if (!fileUrl) {
      return fileUrl
    }

    const cacheInfo = await dBServicemediaCache.getMediaInfo({ url: fileUrl })
    if (cacheInfo && await fileExists(cacheInfo.path)) {
      const localPath = `file://${cacheInfo.path}`
      this.cacheFile[fileUrl] = localPath
      return localPath
    }

    this.cacheFile[fileUrl] = fileUrl
    this.add(type, fileUrl).catch((error) => {
      logger.error({
        text: '媒体缓存异步下载失败',
        data: { fileUrl, error: (error as Error)?.message },
      })
    })

    return fileUrl
  }

  async remove(fileUrl: string): Promise<void> {
    logger.info({ text: '开始移除媒体缓存', data: { fileUrl } })
    const cacheInfo = await dBServicemediaCache.getMediaInfo({ url: fileUrl })
    if (this.cacheFile[fileUrl]) {
      delete this.cacheFile[fileUrl]
    }
    if (cacheInfo) {
      await deleteFile(cacheInfo.path)
      await dBServicemediaCache.deleteMedia({ url: fileUrl })
    }
    logger.info({ text: '媒体缓存移除完成', data: { fileUrl, removed: Boolean(cacheInfo) } })
  }
}

export default new MediaManager()
