import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import router from './routes/index'

/**
 * 本地 HTTP 服务
 * 基于 Koa 2.x + @koa/router
 */
class LocalServer {
  private app: Koa
  private server: any = null

  constructor() {
    this.app = new Koa()

    // 按洋葱模型顺序注册中间件和路由
    this.initApp()
  }

  /**
   * 初始化应用（洋葱模型：外层 → 内层）
   */
  private initApp(): void {
    // 1. CORS
    this.app.use(cors())

    // 2. Body Parser
    this.app.use(bodyParser())

    // 3. 路由（最内层）
    this.app.use(router.routes())
    this.app.use(router.allowedMethods())
  }

  /**
   * 启动服务
   */
  async start(): Promise<void> {
    try {

      this.server = this.app.listen(58794, '127.0.0.1', () => {
      })

      this.server.on('error', (err: any) => {
      })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.server) {
      this.server.close(() => {
      })
      this.server = null
    }
  }

}

export default new LocalServer()
