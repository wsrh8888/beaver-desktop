/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import router from './routes/index'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('LocalServer')

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
    const port = 38794
    try {
      this.server = this.app.listen(port, '127.0.0.1', () => {
        logger.info({ text: '本地 HTTP 服务启动成功', data: { port, host: '127.0.0.1' } })
      })

      this.server.on('error', (err: any) => {
        logger.error({ text: '本地 HTTP 服务运行时错误', data: { message: err?.message } })
      })
    } catch (error: any) {
      logger.error({ text: '本地 HTTP 服务启动失败', data: { message: error?.message, port } })
      throw error
    }
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.server) {
      const port = (this.server as any)?.address()?.port
      this.server.close(() => {
        logger.info({ text: '本地 HTTP 服务已停止', data: { port } })
      })
      this.server = null
    }
  }

}

export default new LocalServer()
