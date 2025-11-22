import type { TrayMenuItem } from 'commonModule/type/preload/app'
import type { BrowserWindow } from 'electron'
import path from 'node:path'
import { app, Menu, nativeImage, Tray } from 'electron'
import { __dirname } from 'mainModule/config'
import { PopupWindow } from './popup'

class TrayHandler {
  private win: BrowserWindow | null = null
  private tray: Tray | null = null
  private popupWindow: PopupWindow | null = null
  private recentMessages: TrayMenuItem[] = []
  private unreadCount: number = 0
  private normalIcon: Electron.NativeImage | null = null
  private flashTimer: NodeJS.Timeout | null = null
  private isFlashing: boolean = false
  private flashState: boolean = false

  init(win: BrowserWindow) {
    if (this.tray)
      return

    const iconPath = path.join(__dirname, '../resource/logo.png')
    this.normalIcon = nativeImage.createFromPath(iconPath) || nativeImage.createEmpty()
    this.tray = new Tray(this.normalIcon)
    this.win = win
    this.popupWindow = new PopupWindow()
    this.createContextMenu()
    this.setupTrayEvents()
  }

  /**
   * 更新未读消息数（显示徽章）
   * 注意：通常不需要手动调用，updateMenu 会自动更新
   */
  updateUnreadCount(count: number) {
    this.unreadCount = count
    app.setBadgeCount(count > 0 ? count : 0)
    this.updateTooltip()

    if (count > 0 && !this.isFlashing) {
      this.startFlashing()
    }
    else if (count === 0 && this.isFlashing) {
      this.stopFlashing()
    }
  }

  /**
   * 更新托盘菜单，显示最近的消息列表
   * 如果消息项已存在（根据 id），则用新的覆盖旧的；否则添加
   */
  updateMenu(messages: TrayMenuItem[] = []) {
    if (!this.tray || !this.win)
      return

    // 如果 id 相同，用新的覆盖旧的；否则添加
    messages.forEach((newMsg) => {
      const existingIndex = this.recentMessages.findIndex(msg => msg.id === newMsg.id)
      if (existingIndex >= 0) {
        this.recentMessages[existingIndex] = newMsg
      }
      else {
        this.recentMessages.push(newMsg)
      }
    })

    this.refreshTray()
  }

  /**
   * 删除托盘菜单项
   */
  deleteMenuItem(id: string) {
    if (!this.tray || !this.win)
      return

    const index = this.recentMessages.findIndex(msg => msg.id === id)
    if (index >= 0) {
      this.recentMessages.splice(index, 1)
      this.refreshTray()
    }
  }

  /**
   * 刷新托盘显示（菜单、tooltip、popup）
   */
  private refreshTray() {
    // 根据是否有消息来决定是否显示徽章和闪烁
    const hasMessages = this.recentMessages.length > 0
    this.updateUnreadCount(hasMessages ? 1 : 0)

    this.createContextMenu()
    this.updateTooltip()

    // 更新 popup 内容（如果正在显示）
    if (this.popupWindow && this.popupWindow.isVisible()) {
      this.popupWindow.updateContent({
        messages: this.recentMessages,
        unreadCount: hasMessages ? 1 : 0,
        logoBase64: this.normalIcon?.toDataURL() || '',
        tray: this.tray!,
        mainWindow: this.win!,
        onMessageClick: (_index) => {
          if (this.win) {
            this.win.show()
            this.win.focus()
          }
        },
        onStopFlash: () => {
          this.recentMessages = []
          this.updateUnreadCount(0)
          this.createContextMenu()
          this.updateTooltip()
        },
      })
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 更新 tooltip
   */
  private updateTooltip() {
    if (!this.tray)
      return

    // 如果有未读消息（闪烁时），不显示tooltip；否则显示应用名称
    if (this.recentMessages.length > 0) {
      this.tray.setToolTip('')
    }
    else {
      this.tray.setToolTip('海狸IM')
    }
  }

  /**
   * 开始闪烁托盘图标
   */
  private startFlashing() {
    if (this.isFlashing || !this.tray || !this.normalIcon)
      return

    this.isFlashing = true
    this.flashState = false
    const emptyIcon = nativeImage.createEmpty()

    this.flashTimer = setInterval(() => {
      if (!this.tray || !this.normalIcon)
        return
      this.flashState = !this.flashState
      this.tray.setImage(this.flashState ? emptyIcon : this.normalIcon)
    }, 500)
  }

  /**
   * 停止闪烁托盘图标
   */
  private stopFlashing() {
    if (!this.isFlashing)
      return

    this.isFlashing = false
    if (this.flashTimer) {
      clearInterval(this.flashTimer)
      this.flashTimer = null
    }
    if (this.tray && this.normalIcon) {
      this.tray.setImage(this.normalIcon)
    }
  }

  /**
   * 设置托盘事件
   */
  private setupTrayEvents() {
    if (!this.tray || !this.win)
      return

    this.tray.on('click', () => {
      if (this.popupWindow) {
        this.popupWindow.hide()
      }
      this.win!.show()
      this.win!.focus()
    })

    if (process.platform === 'win32') {
      this.tray.on('mouse-enter', () => {
        // 鼠标进入托盘，显示 popup（不清除隐藏定时器，保持显示）
        this.showPopup()
      })
      this.tray.on('mouse-leave', () => {
        // 鼠标离开托盘，开始检查（如果鼠标在弹窗上则保持显示）
        if (this.popupWindow && this.tray) {
          const bounds = this.tray.getBounds()
          this.popupWindow.startMouseCheck(bounds)
        }
      })
    }
  }

  /**
   * 创建右键菜单
   */
  private createContextMenu() {
    if (!this.tray || !this.win)
      return

    const menuItems: Electron.MenuItemConstructorOptions[] = [
      {
        label: '打开海狸',
        click: () => {
          this.win!.show()
          this.win!.focus()
        },
      },
      { label: '退出海狸', click: () => app.quit() },
    ]

    this.tray.setContextMenu(Menu.buildFromTemplate(menuItems))
  }

  // ==================== Popup 窗口相关 ====================

  /**
   * 显示 popup 窗口
   */
  private showPopup() {
    if (this.unreadCount === 0 || this.recentMessages.length === 0 || !this.popupWindow)
      return

    this.popupWindow.show({
      messages: this.recentMessages,
      unreadCount: this.unreadCount,
      logoBase64: this.normalIcon?.toDataURL() || '',
      tray: this.tray!,
      mainWindow: this.win!,
      onMessageClick: (_index) => {
        if (this.win) {
          this.win.show()
          this.win.focus()
        }
      },
      onStopFlash: () => {
        this.recentMessages = []
        this.updateUnreadCount(0)
        this.createContextMenu()
        this.updateTooltip()
      },
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.stopFlashing()
    if (this.popupWindow) {
      this.popupWindow.destroy()
      this.popupWindow = null
    }
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
    this.win = null
    this.recentMessages = []
    this.normalIcon = null
    this.unreadCount = 0
  }
}

export default new TrayHandler()
