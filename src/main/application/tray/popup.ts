import type { TrayMenuItem } from 'commonModule/type/preload/app'
import type { BrowserWindow, Tray } from 'electron'
import { BrowserWindow as ElectronBrowserWindow, screen } from 'electron'

export interface PopupWindowOptions {
  messages: TrayMenuItem[]
  unreadCount: number
  logoBase64: string
  tray: Tray
  mainWindow: BrowserWindow
  onMessageClick?(index: number): void
  onStopFlash?(): void
}

export interface TrayBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Popup 窗口管理器
 * 负责管理托盘图标的 popup 窗口显示、隐藏和交互
 */
class PopupWindow {
  private window: ElectronBrowserWindow | null = null
  private hideTimer: NodeJS.Timeout | null = null
  private checkTimer: NodeJS.Timeout | null = null
  private readonly HIDE_DELAY = 1000 // 1秒延迟隐藏
  private readonly CHECK_INTERVAL = 500 // 每 500ms 检查一次鼠标位置

  /**
   * 显示 popup 窗口
   */
  show(options: PopupWindowOptions) {
    // 如果没有消息，不显示
    if (options.unreadCount === 0 || options.messages.length === 0) {
      return
    }

    // 清除隐藏定时器（鼠标在托盘上，弹窗应该一直显示）
    this.clearHideTimer()
    this.stopMouseCheck()

    // 如果窗口已存在，更新内容并显示
    if (this.window && !this.window.isDestroyed()) {
      // 确保窗口层级保持最高
      this.window.setAlwaysOnTop(true, 'screen-saver')
      this.updateContent(options)
      this.updatePosition(options.tray)
      if (!this.window.isVisible()) {
        this.window.show()
      }
      return
    }

    // 创建新窗口
    this.createWindow(options)
  }

  /**
   * 隐藏 popup 窗口
   */
  hide() {
    // 临时注释掉自动隐藏，方便调试
    this.clearHideTimer()
    this.stopMouseCheck()
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide()
    }
  }

  /**
   * 更新 popup 内容
   */
  updateContent(options: PopupWindowOptions) {
    if (!this.window || this.window.isDestroyed())
      return

    // 动态调整窗口高度（根据消息数量，最多4条）
    const displayCount = Math.min(options.messages.length, 4)
    const newHeight = 42 + displayCount * 30 + 5
    const currentBounds = this.window.getBounds()

    if (currentBounds.height !== newHeight) {
      this.window.setSize(currentBounds.width, newHeight)
      // 高度变化后需要重新计算位置
      if (options.tray) {
        this.updatePosition(options.tray)
      }
    }

    const html = this.generateHTML(options)
    this.window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  }

  /**
   * 检查窗口是否可见
   */
  isVisible(): boolean {
    return this.window !== null && !this.window.isDestroyed() && this.window.isVisible()
  }

  /**
   * 销毁 popup 窗口
   */
  destroy() {
    this.hide()
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy()
      this.window = null
    }
  }

  /**
   * 创建 popup 窗口
   */
  private createWindow(options: PopupWindowOptions) {
    const popupWidth = 220
    // 最多显示4条消息，超过4条的高度固定为4条的高度
    const displayCount = Math.min(options.messages.length, 4)
    const popupHeight = 42 + displayCount * 30 + 5

    this.window = new ElectronBrowserWindow({
      width: popupWidth,
      height: popupHeight,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      focusable: false, // 临时改为 true，方便调试
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
      },
    })

    this.updatePosition(options.tray)
    this.updateContent(options)
    this.setupEvents(options)
    // 设置最高层级，确保弹窗始终在最上层
    this.window.setAlwaysOnTop(true, 'screen-saver')
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    this.window.show()
    // 临时：打开开发者工具用于调试样式
    // this.window.webContents.openDevTools()
    // 不立即开始检查，等待鼠标离开托盘或弹窗（临时注释掉自动隐藏）
    // this.stopMouseCheck()
  }

  /**
   * 设置窗口事件
   */
  private setupEvents(options: PopupWindowOptions) {
    if (!this.window)
      return

    this.window.webContents.on('console-message', (_event, _level, message) => {
      if (message.startsWith('TRAY_CLICK:')) {
        const index = Number.parseInt(message.split(':')[1])
        if (!Number.isNaN(index) && index >= 0 && index < options.messages.length) {
          this.hide()
          options.onMessageClick?.(index)
        }
      }
      else if (message === 'TRAY_STOP_FLASH') {
        this.hide()
        options.onStopFlash?.()
      }
    })

    this.window.on('closed', () => {
      this.window = null
      this.stopMouseCheck()
    })
  }

  /**
   * 更新窗口位置（固定在托盘图标上方）
   */
  private updatePosition(tray: Tray) {
    if (!this.window || this.window.isDestroyed())
      return

    const bounds = tray.getBounds()
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
    const workArea = display.workArea
    const popupBounds = this.window.getBounds()

    const trayCenterX = bounds.x + bounds.width / 2
    const popupX = trayCenterX - popupBounds.width / 2

    // 计算 popup 底部应该对齐托盘图标顶部
    // bounds.y 是托盘图标的顶部 Y 坐标
    // popupBounds.height 是 popup 窗口的高度
    // 所以 popup 的 Y 坐标 = bounds.y - popupBounds.height（让 popup 底部对齐托盘顶部）
    const popupY = bounds.y - popupBounds.height

    const finalX = Math.max(workArea.x + 5, Math.min(popupX, workArea.x + workArea.width - popupBounds.width - 5))
    const finalY = Math.max(workArea.y + 5, popupY)

    this.window.setPosition(Math.round(finalX), Math.round(finalY))
  }

  /**
   * 开始鼠标位置检查
   * 检查鼠标是否在托盘或弹窗上，如果都不在，则延迟隐藏
   */
  startMouseCheck(trayBounds: TrayBounds) {
    // 确保先停止之前的检查
    this.stopMouseCheck()
    // 不清除定时器，让之前的定时器继续（如果存在）

    const checkMousePosition = () => {
      if (!this.window || this.window.isDestroyed() || !this.window.isVisible()) {
        this.stopMouseCheck()
        this.clearHideTimer()
        return
      }

      const point = screen.getCursorScreenPoint()
      const popupBounds = this.window.getBounds()

      // 检查鼠标是否在弹窗上
      const isMouseInPopup = point.x >= popupBounds.x && point.x <= popupBounds.x + popupBounds.width
        && point.y >= popupBounds.y && point.y <= popupBounds.y + popupBounds.height

      // 检查鼠标是否在托盘上
      const isMouseInTray = point.x >= trayBounds.x && point.x <= trayBounds.x + trayBounds.width
        && point.y >= trayBounds.y && point.y <= trayBounds.y + trayBounds.height

      if (isMouseInPopup || isMouseInTray) {
        // 鼠标在托盘或弹窗上，清除隐藏定时器（保持显示）
        this.clearHideTimer()
      }
      else {
        // 鼠标不在托盘和弹窗上
        // 如果还没有定时器，设置一个2秒的定时器
        if (!this.hideTimer) {
          this.scheduleHide()
        }
        // 如果已经有定时器，让它继续倒计时，不要重置
      }
    }

    // 立即检查一次
    checkMousePosition()

    // 然后定期检查
    this.checkTimer = setInterval(checkMousePosition, this.CHECK_INTERVAL)
  }

  /**
   * 停止鼠标位置检查
   */
  private stopMouseCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
  }

  /**
   * 延迟隐藏
   * 只在没有定时器时才设置，避免频繁重置
   */
  private scheduleHide() {
    // 如果已经有定时器，不重复设置
    if (this.hideTimer) {
      return
    }

    this.hideTimer = setTimeout(() => {
      this.hideTimer = null

      // 定时器到期时，再次检查鼠标位置
      if (!this.window || this.window.isDestroyed() || !this.window.isVisible()) {
        this.hide()
        return
      }

      const bounds = this.window.getBounds()
      const point = screen.getCursorScreenPoint()
      const isMouseInPopup = point.x >= bounds.x && point.x <= bounds.x + bounds.width
        && point.y >= bounds.y && point.y <= bounds.y + bounds.height

      // 如果鼠标不在弹窗上，隐藏
      if (!isMouseInPopup) {
        this.hide()
      }
    }, this.HIDE_DELAY)
  }

  /**
   * 清除隐藏定时器
   */
  private clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
  }

  /**
   * 生成 HTML 内容
   */
  private generateHTML(options: PopupWindowOptions): string {
    // 最多显示4条消息，超过的用 display: none 隐藏
    const messagesHTML = options.messages.map((msg, index) => {
      const title = this.escapeHtml(msg.label.length > 30 ? `${msg.label.substring(0, 30)}...` : msg.label)
      const count = msg.count || 0
      const displayStyle = index >= 4 ? 'display: none;' : ''
      return `
        <div class="message-item" data-index="${index}" data-id="${this.escapeHtml(msg.id)}" style="${displayStyle}">
          <svg class="message-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          <span class="message-title">${title}</span>
          ${count > 0 ? `<span class="message-count">${count}</span>` : ''}
        </div>
      `
    }).join('')

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: none;
      margin: 0;
      padding: 0;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
      border-bottom: 1px solid #e9ecef;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo {
      width: 18px;
      height: 18px;
      border-radius: 3px;
    }
    .app-name {
      font-size: 13px;
      font-weight: 600;
      color: #212529;
      letter-spacing: 0.2px;
    }
    .stop-flash-btn {
      font-size: 11px;
      color: #6c757d;
      background: transparent;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      padding: 3px 8px;
      transition: all 0.2s;
    }
    .stop-flash-btn:hover {
      color: #495057;
      background: #f8f9fa;
      border-color: #adb5bd;
    }
    .messages {
      max-height: 160px;
      overflow-y: auto;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    .messages::-webkit-scrollbar {
      width: 6px;
    }
    .messages::-webkit-scrollbar-track {
      background: #f8f9fa;
    }
    .messages::-webkit-scrollbar-thumb {
      background: #ced4da;
      border-radius: 3px;
    }
    .messages::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }
    .message-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-bottom: 1px solid #f1f3f5;
      cursor: pointer;
      transition: background 0.15s;
      margin: 0;
    }
    .message-item:hover {
      background: #f8f9fa;
    }
    .message-item:last-child {
      border-bottom: none;
    }
    .message-icon {
      color: #6c757d;
      flex-shrink: 0;
      opacity: 0.7;
    }
    .message-title {
      flex: 1;
      font-size: 12px;
      color: #212529;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
    .message-count {
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      border-radius: 10px;
      padding: 2px 6px;
      min-width: 18px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <img class="logo" src="${options.logoBase64}" alt="logo">
      <span class="app-name">海狸</span>
    </div>
    <button class="stop-flash-btn" onclick="console.log('TRAY_STOP_FLASH')">取消闪动</button>
  </div>
  <div class="messages">
    ${messagesHTML}
  </div>
  <script>
    document.querySelectorAll('.message-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log('TRAY_CLICK:' + index)
      })
    })
  </script>
</body>
</html>
    `
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
