import RenderToMainHandler from './render-to-main'

class IpcManager {
  constructor() {}

  init() {
    RenderToMainHandler.init()
  }
}

export default new IpcManager()
