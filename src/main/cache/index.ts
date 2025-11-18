/**
 * 媒体缓存服务
 * 简洁高效的文件缓存管理
 */

import type { CacheType } from 'commonModule/type/cache/cache'
import type { DownloadedFileInfo } from 'mainModule/utils/file/download'
import * as path from 'node:path'
import { previewOnlineFileApi } from 'mainModule/api/file'
import { getRootPath } from 'mainModule/config'
import { downloadFile } from 'mainModule/utils/file/download'
import { mediaCacheService } from '../database/services/media/media'
import { calculateFileMD5, createDir, deleteFile, fileExists, getFileSize } from '../utils/file'
import { cacheConfig, cacheTypeToFilePath } from './config'

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
  private downloadingFiles: Set<string> = new Set() // 记录正在下载的文件，避免并发下载同一个文件
  private cacheFile: Record<string, string> = {}

  constructor() {
    this.cacheRoot = path.join(getRootPath(), 'cache')
  }

  init(userId?: string) {
    this.userId = userId
    // 从配置根目录开始递归处理
    this.processConfigAndCreateDirs(cacheConfig, this.cacheRoot, userId)
  }

  /**
   * 递归处理配置对象并直接创建目录
   * @param config 配置对象
   * @param currentPath 当前路径
   * @param userId 用户ID，用于处理占位符
   */
  private async processConfigAndCreateDirs(config: any, currentPath: string, userId?: string): Promise<void> {
    for (const [key, value] of Object.entries(config)) {
      if (key === '[userId]') {
        if (!userId)
          continue // 没有userId，跳过用户目录
        // 直接用userId创建目录，然后递归处理子配置
        const userPath = path.join(currentPath, userId)
        await createDir(userPath)
        await this.processConfigAndCreateDirs(value, userPath, userId)
      }
      else if (typeof value === 'object' && value !== null) {
        // 普通目录，直接创建并递归
        const newPath = path.join(currentPath, key)
        await createDir(newPath)
        await this.processConfigAndCreateDirs(value, newPath, userId)
      }
    }
  }

  // ============ 核心CRUD方法 ============

  /**
   * 添加缓存记录到数据库
   * 根据文件类型自动决定缓存目录路径
   *
   * 对应config.ts中的目录：
   * - images: 图片文件
   * - videos: 视频文件
   * - voices: 语音文件
   * - avatars: 用户头像
   */
  async add(type: CacheType, fileKey: string): Promise<string | null> {
    const fileUrl = previewOnlineFileApi(fileKey)

    // 检查是否已经在下载中
    if (this.downloadingFiles.has(fileKey)) {
      return fileUrl
    }

    // 标记开始下载
    this.downloadingFiles.add(fileKey)

    try {
      if (!fileKey) {
        throw new Error('fileKey is not set')
      }
      // 从 fileKey 中提取 MD5（去掉文件后缀）
      const lastDotIndex = fileKey.lastIndexOf('.')
      const expectedMd5 = lastDotIndex > 0 ? fileKey.substring(0, lastDotIndex) : fileKey

      // 根据类型获取文件路径
      let filePath = cacheTypeToFilePath[type]
      // 判断路径是否存在[userId]占位符，如果存在则替换为userId
      if (filePath.includes('[userId]')) {
        if (!this.userId) {
          throw new Error('userId is not set')
        }
        filePath = filePath.replace('[userId]', this.userId)
      }

      // 构建完整的输出路径（包含文件名）
      const outputPath = path.join(this.cacheRoot, filePath, fileKey)

      // 检查文件是否已存在且MD5正确
      if (await fileExists(outputPath)) {
        console.log('缓存文件已存在，验证MD5: ', outputPath)
        try {
          const existingFileMd5 = await calculateFileMD5(outputPath)
          if (existingFileMd5 === expectedMd5) {
            console.log('MD5验证通过，直接保存到数据库: ', fileKey)
            // 获取文件大小
            const fileSize = await getFileSize(outputPath)
            // 保存到数据库（直接使用 fileKey 作为主键）
            await mediaCacheService.upsert(fileKey, outputPath, type, fileSize)
            return outputPath
          }
          else {
            console.warn(`缓存文件MD5不匹配，删除旧文件重新下载: ${fileKey}. Expected: ${expectedMd5}, Got: ${existingFileMd5}`)
            await deleteFile(outputPath)
          }
        }
        catch (error) {
          console.warn(`验证缓存文件MD5失败，删除文件重新下载: ${fileKey}`, (error as Error).message)
          await deleteFile(outputPath)
        }
      }

      console.log('开始下载文件: ', fileUrl)
      // 确保目录存在
      await createDir(path.dirname(outputPath))

      // 下载文件到本地并获取文件信息
      const downloadedFile: DownloadedFileInfo = await downloadFile(fileUrl, outputPath)

      console.log('下载文件完成: ', outputPath)
      if (downloadedFile.md5 !== expectedMd5) {
        // MD5 不匹配，删除下载的文件
        await deleteFile(outputPath)
        console.warn(`MD5 verification failed for ${fileKey}. Expected: ${expectedMd5}, Got: ${downloadedFile.md5}`)
        return fileUrl
      }

      // 保存到数据库（直接使用 fileKey 作为主键）
      await mediaCacheService.upsert(fileKey, outputPath, type, downloadedFile.size)

      return outputPath
    }
    catch (error) {
      // 下载失败，静默处理，返回在线URL
      console.warn(`Cache download failed for ${fileKey}`)
      console.error((error as Error)?.message)
      console.error('fileUrl: ', fileUrl)
      return fileUrl
    }
  }

  /**
   * 查询缓存文件路径
   */
  async get(type: CacheType, fileKey: string): Promise<string> {
    console.log('开始查询缓存文件: ', fileKey)
    const fileUrl = previewOnlineFileApi(fileKey)
    if (this.cacheFile[fileKey]) {
      return this.cacheFile[fileKey]
    }
    else {
      this.cacheFile[fileKey] = fileUrl
    }

    if (!fileKey) {
      console.warn('fileName is not set')
      return fileUrl
    }

    const cacheInfo = await mediaCacheService.getMediaInfo(fileKey)
    if (cacheInfo) {
      console.log('缓存文件存在: ', cacheInfo.path)
      this.cacheFile[fileKey] = 'file://' + cacheInfo.path
      return 'file://' + cacheInfo.path
    }
    console.log('缓存文件不存在: ', fileKey)
    // 检查是否正在下载这个文件，如果是则直接返回在线URL

    // 没有缓存，异步下载到本地（不阻塞返回）
    this.add(type, fileKey).catch(() => {
      // 下载失败静默处理
    })

    // 返回在线URL
    return fileUrl
  }

  /**
   * 删除缓存（软删除 + 物理删除文件）
   */
  async remove(fileKey: string): Promise<void> {
    const cacheInfo = await mediaCacheService.getMediaInfo(fileKey)
    if (this.cacheFile[fileKey]) {
      delete this.cacheFile[fileKey]
    }
    if (cacheInfo) {
      // 物理删除文件
      await deleteFile(cacheInfo.path)
      // 数据库软删除
      await mediaCacheService.deleteMedia(fileKey)
    }
  }
}

// 导出单例实例
export default new MediaManager()
