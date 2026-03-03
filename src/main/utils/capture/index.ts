import type { Size } from 'electron'
import { desktopCapturer } from 'electron'
import Screenshots from 'electron-screenshots'

/** 选区截屏插件单例（复用窗口加快二次打开），首次调用 getScreenshots 时创建 */
let screenshotsInstance: InstanceType<typeof Screenshots> | null = null

export function getScreenshots(): InstanceType<typeof Screenshots> {
  if (!screenshotsInstance) {
    screenshotsInstance = new Screenshots({ singleWindow: true })
  }
  return screenshotsInstance
}
