import type { AxiosResponse } from 'axios'
import type { RenderCommand } from 'commonModule/type/ipc/command'
import { ClipboardCommand } from 'commonModule/type/ipc/command'
import { CacheType } from 'commonModule/type/cache/cache'
import { fileURLToPath } from 'node:url'
import { clipboard, nativeImage } from 'electron'
import cacheManager from 'mainModule/cache'
import head from 'mainModule/utils/request/head'

type ClipboardData = { fileKey?: string, text?: string }

class ClipboardHandler {
  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: ClipboardCommand | RenderCommand,
    data: ClipboardData,
  ): boolean | Promise<boolean> {
    switch (command) {
      case ClipboardCommand.COPY_IMAGE:
        return this.copyImage(data.fileKey ?? '')
      case ClipboardCommand.COPY_TEXT:
        return this.copyText(data.text ?? '')
      default:
        return false
    }
  }

  private copyText(text: string): boolean {
    if (!text?.trim())
      return false
    clipboard.writeText(text)
    return true
  }

  /**
   * 有且只有 2 种情况：本地缓存（file://）或云端 URL（http(s)）
   */
  private async copyImage(fileKey: string): Promise<boolean> {
    if (!fileKey?.trim())
      return false
    try {
      const urlOrPath = await cacheManager.get(CacheType.USER_IMAGE, fileKey)
      let img: Electron.NativeImage | null = null

      if (!urlOrPath.startsWith('file://')) {
        // 本地：缓存文件路径
        const localPath = fileURLToPath(urlOrPath)
        img = nativeImage.createFromPath(localPath)
      }
      else {
        // 云端：在线 URL，用封装好的 head 拉取后写剪贴板
        const res = await head({ url: urlOrPath, method: 'GET', responseType: 'arraybuffer' }).catch(() => null) as AxiosResponse<ArrayBuffer> | null
        if (res?.status === 200 && res.data) {
          const buf = Buffer.from(res.data)
          img = nativeImage.createFromBuffer(buf)
        }
      }

      if (img && !img.isEmpty()) {
        clipboard.writeImage(img)
        return true
      }
      return false
    }
    catch (e) {
      console.warn('clipboard copyImage failed', fileKey, (e as Error)?.message)
      return false
    }
  }
}

export default new ClipboardHandler()
