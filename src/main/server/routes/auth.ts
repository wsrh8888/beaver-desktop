import Router from '@koa/router'
import quickSignHandler from '../handlers/auth/quick-sign'

/**
 * 认证模块路由
 */
const authRouter = new Router({ prefix: '/auth' })

// 获取快捷登录状态（仅返回用户信息）
authRouter.get('/quick_sign', quickSignHandler)

export default authRouter
