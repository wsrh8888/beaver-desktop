import type { BrowserWindow } from 'electron'
import type { EmbedViewLoadState, IEmbedViewBounds } from 'commonModule/type/main/embed-view'
import { WORKBENCH_EMBED_STATE_CHANNEL } from 'commonModule/type/main/web-contents-view/workbench'
import { WebContentsView } from 'electron'

/** 工作台内嵌 WebContentsView，只管理 tabId → 实例，显示哪个 Tab 由渲染层决定 */
class WorkbenchWebContentsView {
  private views = new Map<string, WebContentsView>()

  open(win: BrowserWindow, tabId: string, url: string, bounds: IEmbedViewBounds) {
    if (this.views.has(tabId))
      this.show(win, tabId, bounds)
    else
      this.create(win, tabId, url, bounds)
  }

  show(win: BrowserWindow, tabId: string, bounds: IEmbedViewBounds) {
    this.detachAll(win)
    const view = this.views.get(tabId)!
    win.contentView.addChildView(view)
    view.setBounds(this.toBounds(bounds))
  }

  hideAll(win: BrowserWindow) {
    this.detachAll(win)
  }

  setBounds(_win: BrowserWindow, tabId: string, bounds: IEmbedViewBounds) {
    this.views.get(tabId)?.setBounds(this.toBounds(bounds))
  }

  reload(_win: BrowserWindow, tabId: string) {
    this.views.get(tabId)?.webContents.reload()
  }

  closeTab(win: BrowserWindow, tabId: string) {
    const view = this.views.get(tabId)
    if (!view)
      return

    this.removeFromWindow(win, view)
    view.webContents.close()
    this.views.delete(tabId)
  }

  detachWindow(win: BrowserWindow) {
    ;[...this.views.keys()].forEach(tabId => this.closeTab(win, tabId))
  }

  private create(win: BrowserWindow, tabId: string, url: string, bounds: IEmbedViewBounds) {
    const view = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    })
    view.setBackgroundColor('#FFFFFF')
    this.views.set(tabId, view)
    this.bindLoadEvents(win, tabId, view)
    view.webContents.loadURL(url)
    this.show(win, tabId, bounds)
  }

  private detachAll(win: BrowserWindow) {
    this.views.forEach(view => this.removeFromWindow(win, view))
  }

  private removeFromWindow(win: BrowserWindow, view: WebContentsView) {
    if (win.isDestroyed())
      return
    if (win.contentView.children.includes(view))
      win.contentView.removeChildView(view)
  }

  private toBounds(bounds: IEmbedViewBounds) {
    return {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    }
  }

  private sendLoadState(win: BrowserWindow, tabId: string, state: EmbedViewLoadState) {
    if (win.isDestroyed())
      return
    win.webContents.send(WORKBENCH_EMBED_STATE_CHANNEL, { tabId, state })
  }

  private bindLoadEvents(win: BrowserWindow, tabId: string, view: WebContentsView) {
    const { webContents } = view
    webContents.on('did-start-loading', () => this.sendLoadState(win, tabId, 'loading'))
    webContents.on('did-stop-loading', () => this.sendLoadState(win, tabId, 'loaded'))
    webContents.on('did-fail-load', (_event, errorCode) => {
      if (errorCode !== -3)
        this.sendLoadState(win, tabId, 'failed')
    })
  }
}

export default new WorkbenchWebContentsView()
