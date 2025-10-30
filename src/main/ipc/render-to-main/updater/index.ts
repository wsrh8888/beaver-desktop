import type { IDownloadOptions } from 'commonModule/type/preload/update'
import fs from 'node:fs'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import { UpdateCommand } from 'commonModule/type/ipc/command'
import { shell } from 'electron'
import { getCachePath } from 'mainModule/utils/config'
import { calculateFileMd5, downloadFile } from 'mainModule/utils/download/index'
import logger from 'mainModule/utils/log'

export class UpdaterHandler {
  /**
   * 统一的升级处理入口
   */
  static handle(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, command: UpdateCommand, data: any) {
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
  private static async handleDownloadUpdate(event: Electron.IpcMainEvent, data: IDownloadOptions) {
    try {
      const { url, md5, version } = data
      logger.info({ text: '开始下载更新', data: { url, md5, version } }, 'UpdaterHandler')

      // 获取升级缓存目录
      const updateDir = getCachePath(CacheType.UPDATE_PACKAGE)

      // 使用版本号_MD5作为文件名，既直观又唯一
      const fileName = `${version}_${md5}.exe`

      // 使用通用下载工具下载文件
      const filePath = await downloadFile(
        url,
        updateDir,
        fileName,
        (progress: number) => {
          event.sender.send(UpdateCommand.DOWNLOAD_PROGRESS, progress)
        },
      )

      // 验证MD5
      const fileMd5 = await calculateFileMd5(filePath)
      if (fileMd5 !== md5) {
        logger.error({ text: 'MD5校验失败', data: { fileMd5, md5 } }, 'UpdaterHandler')
        // 删除下载的文件
        fs.unlinkSync(filePath)
        throw new Error('MD5校验失败')
      }

      logger.info({ text: '下载完成', data: { filePath } }, 'UpdaterHandler')
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
  private static async handleStartUpdate(event: Electron.IpcMainEvent, data: IDownloadOptions) {
    try {
      const { url, md5, version } = data
      logger.info({ text: '开始升级', data: { url, md5, version } }, 'UpdaterHandler')

      // 根据data中的信息构建文件路径
      const updateDir = getCachePath(CacheType.UPDATE_PACKAGE)
      const fileName = `${version}_${md5}.exe`
      const filePath = path.join(updateDir, fileName)

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
