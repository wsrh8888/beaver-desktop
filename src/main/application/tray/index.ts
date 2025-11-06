import type { BrowserWindow } from 'electron'
import path from 'node:path'
import { app, Menu, nativeImage, Tray } from 'electron'
import { __dirname } from 'mainModule/config'

class TrayHandler {
  private win: BrowserWindow | null = null
  private tray: Tray | null = null

  init(win: BrowserWindow) {
    if (this.tray)
      return // 已经初始化过了

    // 使用 app.getAppPath() 获取应用根目录，然后构建资源路径
    const iconPath = path.join(__dirname, '../resource/logo.png')

    const icon = nativeImage.createFromPath(iconPath) || nativeImage.createEmpty()

    this.tray = new Tray(icon)
    this.win = win
    this.createContextMenu()
    this.setupTrayEvents()
  }

  private createContextMenu() {
    if (!this.tray || !this.win)
      return

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开海狸',
        click: () => {
          this.win!.show()
        },
      },
      {
        label: '退出海狸',
        click: () => {
          app.quit()
        },
      },
    ])

    this.tray.setToolTip('海狸IM')
    this.tray.setContextMenu(contextMenu)
  }

  private setupTrayEvents() {
    if (!this.tray || !this.win)
      return

    this.tray.on('click', () => {
      this.win!.show()
    })
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
    this.win = null
  }
}

export default new TrayHandler()
