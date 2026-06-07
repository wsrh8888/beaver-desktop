import { CacheType } from 'commonModule/type/cache/cache'
import { calculateFileMD5, createDir, getCacheLocalFileName, moveDownloadToCache } from 'mainModule/utils/file'
import fs from 'node:fs'
import path from 'node:path'
import { UpdateCommand } from 'commonModule/type/ipc/command'
import { shell } from 'electron'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath } from 'mainModule/config'
import dBServicemediaCache from 'mainModule/database/services/media/media'
import { downloadFile } from 'mainModule/utils/download/index'
import logger from 'mainModule/utils/log'

class UpdaterHandler {
  /**
   * 统一的升级处理入口
   */
  handle(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: UpdateCommand, data: any) {
    logger.info({ text: '收到render-to-main-msg升级消息', data: {
      command,
      data,
    } }, 'UpdaterHandler')

    switch (command) {
      case UpdateCommand.DOWNLOAD_UPDATE:
        this.handleDownloadUpdate(event, data)
        break
      case UpdateCommand.START_UPDATE:
        this.handleStartUpdate(event, data)
        break
      default:
        console.error(`升级处理未知命令: ${command}`)
    }
  }

  /**
   * 处理下载更新
   */
  private async handleDownloadUpdate(event: Electron.IpcMainEvent, data: IDownloadOptions) {
    try {
      const { fileUrl, md5, version } = data
      logger.info({ text: '开始下载更新', data: { fileUrl, md5, version } }, 'UpdaterHandler')

      const cacheRoot = getCachePath()
      const updateDir = path.join(cacheRoot, cacheTypeToFilePath[CacheType.PUBLIC_UPDATE])
      const downloadUrl = fileUrl
      const filePath = path.join(updateDir, getCacheLocalFileName(md5 || version, fileUrl))

      if (fs.existsSync(filePath)) {
        if (!md5) {
          event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, 100)
          return
        }
        const existingMd5 = await calculateFileMD5(filePath)
        if (existingMd5 === md5) {
          await dBServicemediaCache.upsert({
            url: fileUrl,
            md5,
            path: filePath,
            type: CacheType.PUBLIC_UPDATE,
            size: fs.statSync(filePath).size,
          })
          logger.info({ text: '安装包已存在，跳过下载', data: { filePath } }, 'UpdaterHandler')
          event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, 100)
          return
        }
      }

      const tempPath = path.join(updateDir, '.tmp', `update-${Date.now()}`)
      await createDir(path.dirname(tempPath))

      const downloadedFile = await downloadFile(
        downloadUrl,
        tempPath,
        (progress: number) => {
          event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, progress)
        },
      )

      if (md5 && downloadedFile.md5 !== md5) {
        logger.error({ text: 'MD5校验失败', data: { fileMd5: downloadedFile.md5, expectedMd5: md5 } }, 'UpdaterHandler')
        fs.unlinkSync(downloadedFile.path)
        throw new Error('MD5校验失败')
      }

      const savedPath = await moveDownloadToCache(tempPath, filePath)

      try {
        await dBServicemediaCache.upsert({
          url: fileUrl,
          md5: downloadedFile.md5,
          path: savedPath,
          type: CacheType.PUBLIC_UPDATE,
          size: downloadedFile.size,
        })
        logger.info({ text: '下载记录已保存到数据库', data: { fileUrl, filePath: savedPath, fileSize: downloadedFile.size } }, 'UpdaterHandler')
      }
      catch (error) {
        logger.error({ text: '保存下载记录失败', data: error }, 'UpdaterHandler')
      }

      logger.info({ text: '下载完成', data: { filePath: savedPath } }, 'UpdaterHandler')
    }
    catch (error) {
      logger.error({ text: '下载失败', data: (error as any)?.message || error }, 'UpdaterHandler')
      event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, -1)
    }
  }

  /**
   * 处理开始升级
   */
  private async handleStartUpdate(event: Electron.IpcMainEvent, data: IDownloadOptions) {
    try {
      const { fileUrl, md5, version } = data
      logger.info({ text: '开始升级', data: { fileUrl, md5, version } }, 'UpdaterHandler')

      const cacheRoot = getCachePath()
      const updateDir = path.join(cacheRoot, cacheTypeToFilePath[CacheType.PUBLIC_UPDATE])
      const filePath = path.join(updateDir, getCacheLocalFileName(md5 || version, fileUrl))

      if (!fs.existsSync(filePath)) {
        throw new Error(`安装包文件不存在: ${filePath}`)
      }

      await shell.openPath(filePath)

      logger.info({ text: '升级程序已启动', data: {
        version,
        filePath,
      } }, 'UpdaterHandler')
    }
    catch (error) {
      logger.error({ text: '升级失败', data: error }, 'UpdaterHandler')
    }
  }
}

export default new UpdaterHandler()
