import type { BrowserWindow } from 'electron'
import path from 'node:path'
import { app, Menu, Tray } from 'electron'
import { __dirname } from 'mainModule/config'

class TrayHandler {
  win: BrowserWindow
  tray: Tray
  constructor(win: BrowserWindow) {
    const iconPath = path.join(__dirname, '../../public/logo.png') // 使用新的logo

    this.tray = new Tray(iconPath)
    this.win = win
    // 初始化托盘处理器
    this.createContextMenu()
    this.setupTrayEvents()
  }

  createContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '退出                      ',
        click: () => {
          app.quit()
        },
      },
    ])

    this.tray.setToolTip('海狸IM')
    this.tray.setContextMenu(contextMenu)
  }

  setupTrayEvents() {
    this.tray.on('click', () => {
      this.win.show()
    })
  }
}

export default TrayHandler
