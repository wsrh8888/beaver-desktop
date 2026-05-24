import Router from '@koa/router'
import authRouter from './auth'

/**
 * 主路由
 * 聚合所有子模块路由
 */
const router = new Router()

// 聚合认证模块路由
router.use(authRouter.routes(), authRouter.allowedMethods())

export default router
