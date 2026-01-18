import type { IDownloadOptions } from 'commonModule/type/preload/update'
import fs from 'node:fs'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import { UpdateCommand } from 'commonModule/type/ipc/command'
import { shell } from 'electron'
import { previewOnlineFileApi } from 'mainModule/api/file'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath, getRootPath } from 'mainModule/config'
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
      const { fileKey, md5, version } = data
      logger.info({ text: '开始下载更新', data: { fileKey, md5, version } }, 'UpdaterHandler')

      // 获取升级缓存目录（绝对路径）
      const cacheRoot = getCachePath()
      const updateDir = path.join(cacheRoot, cacheTypeToFilePath[CacheType.PUBLIC_UPDATE])

      // 构建完整的文件路径（直接使用 fileKey 作为文件名）
      const filePath = path.join(updateDir, fileKey)

      // 使用通用下载工具下载文件
      const downloadedFile = await downloadFile(
        previewOnlineFileApi(fileKey), // 下载URL
        filePath, // 完整文件路径
        (progress: number) => {
          event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, progress)
        }, // 进度回调
      )

      // 验证MD5
      if (downloadedFile.md5 !== md5) {
        logger.error({ text: 'MD5校验失败', data: { fileMd5: downloadedFile.md5, expectedMd5: md5 } }, 'UpdaterHandler')
        // 删除下载的文件
        fs.unlinkSync(downloadedFile.path)
        throw new Error('MD5校验失败')
      }

      // 保存下载记录到数据库
      try {
        await dBServicemediaCache.upsert(fileKey, downloadedFile.path, CacheType.PUBLIC_UPDATE, downloadedFile.size)
        logger.info({ text: '下载记录已保存到数据库', data: { fileKey, filePath: downloadedFile.path, fileSize: downloadedFile.size } }, 'UpdaterHandler')
      }
      catch (error) {
        logger.error({ text: '保存下载记录失败', data: error }, 'UpdaterHandler')
        // 保存失败不影响下载结果，只记录错误
      }

      logger.info({ text: '下载完成', data: { filePath: downloadedFile.path } }, 'UpdaterHandler')
    }
    catch (error) {
      logger.error({ text: '下载失败', data: (error as any)?.message || error }, 'UpdaterHandler')
      // 发送错误进度
      event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, -1)
    }
  }

  /**
   * 处理开始升级
   */
  private async handleStartUpdate(event: Electron.IpcMainEvent, data: IDownloadOptions) {
    try {
      const { fileKey, md5, version } = data
      logger.info({ text: '开始升级', data: { fileKey, md5, version } }, 'UpdaterHandler')

      // 根据data中的信息构建文件路径（绝对路径）
      const cacheRoot = getCachePath()
      const updateDir = path.join(cacheRoot, cacheTypeToFilePath[CacheType.PUBLIC_UPDATE])
      const filePath = path.join(updateDir, fileKey)

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`安装包文件不存在: ${filePath}`)
      }

      // 运行安装程序（支持Windows和Mac）
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
